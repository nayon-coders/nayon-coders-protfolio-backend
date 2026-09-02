/**
 * Simple in-memory rate limiter to prevent spam
 * Stores IP addresses and request timestamps
 */
const rateLimitCache = new Map();

// Clear old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitCache.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      rateLimitCache.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const contactRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const timeWindow = 60 * 1000; // 1 minute
  const maxRequests = 3; // Max 3 requests per minute

  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, { count: 1, timestamp: now });
    return next();
  }

  const data = rateLimitCache.get(ip);

  // If time window has passed, reset count
  if (now - data.timestamp > timeWindow) {
    rateLimitCache.set(ip, { count: 1, timestamp: now });
    return next();
  }

  // If within time window, check limit
  if (data.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  // Increment count
  data.count += 1;
  rateLimitCache.set(ip, data);
  next();
};

module.exports = { contactRateLimiter };
