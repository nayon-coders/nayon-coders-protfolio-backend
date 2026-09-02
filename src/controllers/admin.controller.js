/**
 * @desc    Get current logged in admin profile
 * @route   GET /api/admin/me
 * @access  Private/Admin
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user is already populated by the requireAuth middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};
