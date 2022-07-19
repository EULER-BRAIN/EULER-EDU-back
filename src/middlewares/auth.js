const { getLoginInfo } = require('../tools/login');

module.exports = (req, res, next) => {
  const loginInfo = getLoginInfo(req);
  req.isStudent = (loginInfo.isStudent ? true : false);
  req.isTeacher = (loginInfo.isTeacher ? true : false);
  req.isLogined = (req.isStudent || req.isTeacher ? true : false);
  req.loginLevel = loginInfo.level || null;
  req.loginStudents = loginInfo.students || null;
  req.loginId = loginInfo.id || null;
  req.loginName = loginInfo.name || null;
  next();
}
