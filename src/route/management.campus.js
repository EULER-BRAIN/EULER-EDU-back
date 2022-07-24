const express = require('express');
const { teacherModel } = require('../db/mongo');
const { query, param, body } = require("express-validator");
const valid = require('../tools/valid');
const patterns = require('../db/regExpPatterns');
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const router = express.Router();

router.use(require('../middlewares/authTeacherCampus'));

router.post("/teacher", async (req, res) => {
  try {
    if (req.loginLevel != 'administrator' && req.loginLevel != 'director') {
      return res.status(402).json({
        error: "management/campus/teacher : Permission denied"
      });
    }
    let teachers = await teacherModel.find({
      campus: req.campusId
    });
    teachers = teachers.map(item => {
      return {
        _id: item._id,
        id: item.id,
        name: item.name,
        level: item.level,
        campusName: req.campusName
      }
    });
    res.json({ teachers });
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/campus/teacher : internal server error"
    })
  }
})

router.post("/teacher/info", [
  body("id").matches(patterns.loginId),
], valid(async (req, res) => {
  try {
    if (req.loginLevel != 'administrator' && req.loginLevel != 'director') {
      return res.status(402).json({
        error: "management/campus/teacher : Permission denied"
      });
    }
    const teacher = await teacherModel.findOne({
      id: req.body.id
    });
    if (!teacher) {
      return res.status(403).json({
        error: "management/campus/teacher : no corresponding teacher"
      })
    }
    res.json({
      teacher: teacher
    })
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/campus/teacher/info : internal server error"
    })
  }
}));

router.post("/teacher/edit/name", [
  body("id").matches(patterns.loginId),
  body("name").matches(patterns.name),
], valid(async (req, res) => {
  try {
    const teacher = await teacherModel.findOne({
      id: req.body.id
    });
    if (!teacher) {
      return res.status(403).json({
        error: "management/campus/edit/name : no corresponding teacher"
      })
    }
    if (teacher.campus.toString() != req.campusId.toString()) {
      return res.status(402).json({
        error: "management/campus/teacher/edit/name : Permission denied"
      });
    }
    if (req.loginLevel != 'administrator' && req.loginLevel == 'director') {
      if (req.body.id != req.loginId) {
        return res.status(402).json({
          error: "management/campus/teacher/edit/name : Permission denied"
        });
      }
    }

    const teacherAfter = await teacherModel.findOneAndUpdate({
      id: req.body.id
    }, {
      name: req.body.name
    }, {
      new: true
    });
    res.json({
      teacher: teacherAfter
    });
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/campus/teacher/edit/name : internal server error"
    })
  }
}));

router.post("/teacher/edit/password", [
  body("id").matches(patterns.loginId),
  body("password").matches(patterns.loginPw),
], valid(async (req, res) => {
  try {
    const teacher = await teacherModel.findOne({
      id: req.body.id
    });
    if (!teacher) {
      return res.status(403).json({
        error: "management/campus/edit/password : no corresponding teacher"
      })
    }
    if (teacher.campus.toString() != req.campusId.toString()) {
      return res.status(402).json({
        error: "management/campus/teacher/edit/password : Permission denied"
      });
    }
    if (req.loginLevel != 'administrator' && req.loginLevel == 'director') {
      if (req.body.id != req.loginId) {
        return res.status(402).json({
          error: "management/campus/teacher/edit/password : Permission denied"
        });
      }
    }

    hasher({ password: req.body.password }, async (err, pass, salt, hash) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          error: "management/campus/teacher/edit/password : internal server error"
        })
      }
      const teacherAfter = await teacherModel.findOneAndUpdate({
        id: req.body.id
      }, {
        salt: salt,
        password: hash,
      }, {
        new: true
      });
      res.json({
        teacher: teacherAfter
      });
    })
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/campus/teacher/edit/password : internal server error"
    })
  }
}));

module.exports = router;
