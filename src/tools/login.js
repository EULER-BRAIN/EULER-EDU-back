const getLoginInfo = (req) => {
  if (req.session.loginInfo) {
    const { time } = req.session.loginInfo;
    const timeFlow = Date.now() - time;
    if (0 <= timeFlow && timeFlow <= 3600000) {
      req.session.loginInfo.time = Date.now();
      const { level, isStudent, isTeacher, students, id, name } = req.session.loginInfo;
      return { level, isStudent, isTeacher, students, id, name };
    }
  }
  return {};
}

const loginParent = (req, students, cb) => {
  req.session.loginInfo = { 
    level: 'student',
    isStudent: true,
    isTeacher: false,
    students: students,
    id: '',
    name: '',
    time: Date.now()
  };
  req.session.save((err) => {
    if (cb) cb(err);
  });
}

const loginTeacher = (req, level, id, name, cb) => {
  req.session.loginInfo = {
    level: level,
    isStudent: false,
    isTeacher: true,
    students: [],
    id: id,
    name: name,
    time: Date.now()
  }
  req.session.save((err) => {
    if (cb) cb(err);
  });
}

const logout = (req, res, cb) => {
  res.status(200).clearCookie('connect.sid', {
    path: '/'
  });
  req.session.destroy((err) => {
    req.session = null;
    if (cb) cb(err);
  })
}

module.exports = {
  getLoginInfo,
  loginParent,
  loginTeacher,
  logout
}
