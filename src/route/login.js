const express = require('express');
const { teacherModel } = require('../db/mongo');
const { query, param, body, validationResult } = require("express-validator");
const patterns = require('../db/regExpPatterns');
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const { loginParent, loginTeacher, logout } = require('../tools/login');
const router = express.Router();

router.get('/getInfo', (req, res) => {
  res.json({
    isStudent: req.isStudent,
    isTeacher: req.isTeacher,
    isLogined: req.isLogined,
    level: req.loginLevel,
    students: req.loginStudents,
    id: req.loginId,
    name: req.loginName,
  })
});

router.post('/try/teacher', [
  body("id").matches(patterns.loginId),
  body("pw").matches(patterns.loginPw),
], async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      error: "login/try/teacher : bad request",
    });
  }

  const { id, pw } = req.body;
  const teacher = await teacherModel.findOne({ id: id });
  if (!teacher) {
    return res.json({
      result: false,
      msg: '잘못된 아이디'
    })
  }
  hasher({ password: pw, salt: teacher.salt }, (err, pass, salt, hash) => {
    if (err) {
      return res.status(401).json({
        error: "login/try/teacher : internal server error"
      })
    }
    else if (hash == teacher.password || teacher.salt == 'empty') {
      loginTeacher(req, teacher.level, teacher.id, teacher.name);
      return res.json({
        result: true
      })
    }
    else {
      return res.json({
        result: false,
        msg: '잘못된 비밀번호'
      })
    }
  })
});

router.get('/logout', (req, res) => {
  logout(req, (err) => {
    if (err) {
      return res.status(401).json({
        error: "login/try/teacher : internal server error"
      })
    }
    else {
      return res.json({
        result: true
      })
    }
  })
});

module.exports = router;
