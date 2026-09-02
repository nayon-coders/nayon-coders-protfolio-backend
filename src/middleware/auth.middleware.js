const { auth, db } = require('../config/firebase');

/**
 * Middleware to verify Firebase Auth Token and check Admin status in Firestore
 */
const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token missing.'
    });
  }

  try {
    // 1. Verify the token using Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    
    // 2. Check if admin exists in Firestore and is active
    const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
    
    if (!adminDoc.exists) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin record not found.'
      });
    }

    const adminData = adminDoc.data();

    if (adminData.role !== 'admin' || adminData.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Account is disabled or unauthorized.'
      });
    }
    
    // 3. Attach full admin profile to request object
    req.user = {
      uid: decodedToken.uid,
      ...adminData
    };
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid or expired token.'
    });
  }
};

module.exports = { requireAuth };
