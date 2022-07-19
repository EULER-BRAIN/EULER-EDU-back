const getLoginInfo = (req) => {
  if (req.session.loginInfo) {
    const { time } = req.session.loginInfo;
    const timeFlow = Date.now() - time;
    if (0 <= timeFlow && timeFlow <= 3600000) {
      req.session.time = Date.now();
      const { level, isStudent, isTeacher, students, id, name } = req.session;
      return { level, isStudent, isTeacher, students, id, name };
    }
  }
  return {};
}

const loginParent = (req, students) => {
  req.session.loginInfo = { 
    level: 'student',
    isStudent: true,
    isTeacher: false,
    students: students,
    id: '',
    name: '',
    time: Date.now()
  };
}

const loginTeacher = (req, level, id, name) => {
  req.session.loginInfo = {
    level: level,
    isStudent: false,
    isTeacher: true,
    students: [],
    id: id,
    name: name,
    time: Date.now()
  }
}

const logout = (req, cb = () => {}) => {
  req.session.destroy((err) => {
    cb(err);
  })
}

module.exports = {
  getLoginInfo,
  loginParent,
  loginTeacher,
  logout
}
