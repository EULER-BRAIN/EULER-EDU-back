const express = require('express');
const { teacherModel } = require('../db/mongo');
const { query, param, body } = require("express-validator");
const validator = require('../middlewares/validator');
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

router.get('/getInfo/campus', async (req, res) => {
  if (!req.isTeacher) {
    return res.json({
      campus: null
    });
  }
  const result = await teacherModel.findOne({ id: req.loginId }, "campus");
  return res.json({
    campus: result?.campus
  });
});

router.post('/try/teacher', [
  body("id").matches(patterns.teacher.id),
  body("pw").matches(patterns.teacher.password),
], validator, async (req, res) => {
  const { id, pw } = req.body;
  const teacher = await teacherModel.findOne({ id: id });
  if (!teacher) {
    return res.json({
      result: false,
      msg: '존재하지 않는 아이디입니다'
    })
  }
  hasher({ password: pw, salt: teacher.salt }, (err, pass, salt, hash) => {
    if (err) {
      return res.status(401).json({
        error: "login/try/teacher : internal server error"
      })
    }
    else if (hash == teacher.password || teacher.salt == 'empty') {
      loginTeacher(req, teacher.level, teacher.id, teacher.name, (err) => {
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
      });
    }
    else {
      return res.json({
        result: false,
        msg: '잘못된 비밀번호입니다'
      })
    }
  })
});

router.get('/logout', (req, res) => {
  logout(req, res, (err) => {
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
