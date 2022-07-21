module.exports = (level) => (req, res, next) => {
  const minLevel = level || 'teacher';
  const levelOrder = ['teacher', 'director', 'administrator'];
  if (!req.isTeacher) {
    return res.status(402).json({
      error: "authTeacher : Permission denied"
    });
  }

  const reqlevel = req.loginLevel;
  if (levelOrder.indexOf(reqlevel) < levelOrder.indexOf(minLevel)) {
    return res.status(402).json({
      error: "authTeacher : Permission denied"
    });
  }
  next();
}
