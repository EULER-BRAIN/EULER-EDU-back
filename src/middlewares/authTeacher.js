const { getLoginInfo } = require('../tools/login');

module.exports = (level) => (req, res, next) => {
  const minLevel = level || 'teacher';
  const levelOrder = ['teacher', 'director', 'administrator'];

  if (!req.isTeacher) {
    return res.status(402).json({
      error: "authTeacher : Permission denied"
    });
  }
  next();
}
