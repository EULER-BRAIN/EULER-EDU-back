const express = require('express');
const { teacherModel, noticeModel, posterModel } = require('../db/mongo');
const awsS3 = require('../db/awsS3');
const { query, param, body } = require("express-validator");
const validator = require('../middlewares/validator');
const patterns = require('../db/regExpPatterns');
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const trans = require('../tools/trans');
const router = express.Router();

const middlewareAuthPoster = require("../middlewares/authTeacherCampus.poster");
router.use(require('../middlewares/authTeacherCampus'));

router.post("/teacher", async (req, res) => {
  try {
    if (req.loginLevel != 'administrator' && req.loginLevel != 'director') {
      return res.status(401).json({
        error: "permission denied"
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
    return res.status(500).json({
      error: "internal server error"
    });
  }
})

router.post("/teacher/info", [
  body("id").matches(patterns.teacher.id),
  validator,
], async (req, res) => {
  try {
    if (req.loginLevel != 'administrator' && req.loginLevel != 'director') {
      return res.status(401).json({
        error: "permission denied"
      });
    }
    const teacher = await teacherModel.findOne({
      id: req.body.id
    });
    if (!teacher) {
      return res.status(404).json({
        error: "no corresponding teacher"
      });
    }
    res.json({
      teacher: teacher
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/teacher/edit/name", [
  body("id").matches(patterns.teacher.id),
  body("name").matches(patterns.teacher.name),
  validator,
], async (req, res) => {
  try {
    const teacher = await teacherModel.findOne({
      id: req.body.id
    });
    if (!teacher) {
      return res.status(404).json({
        error: "no corresponding teacher"
      });
    }
    if (teacher.campus.toString() != req.campusId.toString()) {
      return res.status(401).json({
        error: "permission denied"
      });
    }
    if (req.loginLevel != 'administrator' && req.loginLevel == 'director') {
      if (req.body.id != req.loginId) {
        return res.status(401).json({
          error: "permission denied"
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
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/teacher/edit/password", [
  body("id").matches(patterns.teacher.id),
  body("password").matches(patterns.teacher.password),
  validator,
], async (req, res) => {
  try {
    const teacher = await teacherModel.findOne({
      id: req.body.id
    });
    if (!teacher) {
      return res.status(404).json({
        error: "no corresponding teacher"
      });
    }
    if (teacher.campus.toString() != req.campusId.toString()) {
      return res.status(401).json({
        error: "permission denied"
      });
    }
    if (req.loginLevel != 'administrator' && req.loginLevel == 'director') {
      if (req.body.id != req.loginId) {
        return res.status(401).json({
          error: "permission denied"
        });
      }
    }

    hasher({ password: req.body.password }, async (err, pass, salt, hash) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: "internal server error"
        });
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
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/notice", [
  body("page").isInt({ min: 1 }),
  validator,
], async (req, res) => {
  try {
    const npp = 50;
    const page = req.body.page;
    let noticesAll = await noticeModel.find({ campus: req.campusId }, "_id");
    if (!noticesAll) noticesAll = [];
    const maxPage = trans.maxPage(noticesAll.length, npp);
    if (page > maxPage) {
      return res.status(416).json({
        error: "out of page scope"
      })
    }
    const notices = await noticeModel.find({ campus: req.campusId }, "_id title link registDate modifyDate isShow author")
      .sort('-registDate').limit(npp).skip(npp*(page-1));
    for (let i = 0; i < notices.length; i++) {
      const author = await teacherModel.findById(notices[i].author, "_id name");
      if (!author) {
        return res.status(409).json({
          error: "conflict on database"
        });
      }
      notices[i].author = author;
    }
    res.json({
      notices,
      page,
      maxPage
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
})

router.post("/notice/add", [
  body("title").matches(patterns.notice.title),
  body("content").isString(),
  body("link").matches(patterns.notice.link),
  body("isShow").isBoolean(),
  validator,
], async (req, res) => {
  try {
    const dateNow = new Date();
    const author = await teacherModel.findOne({ id: req.loginId }, "_id");
    if (!author) {
      return res.status(500).json({
        error: "internal server error"
      });
    }
    const notice = new noticeModel({
      title: req.body.title,
      content: req.body.content,
      link: req.body.link,
      registDate: dateNow,
      modifyDate: dateNow,
      isShow: req.body.isShow,
      campus: req.campusId,
      author: author._id
    });
    const noticeSaved = await notice.save();
    res.json({
      notice: noticeSaved
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/poster", [
  body("page").isInt({ min: 1 }),
  validator,
], async (req, res) => {
  try {
    const npp = 50;
    const page = req.body.page;
    let postersAll = await posterModel.find({ campus: req.campusId }, "_id");
    if (!postersAll) postersAll = [];
    const maxPage = trans.maxPage(postersAll.length, npp);
    if (page > maxPage) {
      return res.status(416).json({
        error: "out of page scope"
      })
    }
    const posters = await posterModel.find({ campus: req.campusId })
      .sort('-registDate').limit(npp).skip(npp*(page-1));
    for (let i = 0; i < posters.length; i++) {
      const author = await teacherModel.findById(posters[i].author, "_id name");
      if (!author) {
        return res.status(409).json({
          error: "conflict on database"
        });
      }
      posters[i].author = author;
    }
    res.json({
      posters,
      page,
      maxPage
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.get("/poster/info/:id", [
  param("id").isMongoId(),
  validator,
], async (req, res) => {
  try {
    const id = req.params.id;
    const poster = await posterModel.findById(id);
    if (!poster) {
      return res.status(404).json({
        error: "no corresponding poster"
      });
    }

    const author = await teacherModel.findById(poster.author, "_id name");
    if(!author) {
      return res.status(409).json({
        error: "conflict on database"
      });
    }
    poster.author = author;

    awsS3.foundObject(`posters/${ poster._id }`, (err, data) => {
      const imgFound = (err ? false : true);
      res.json({ poster, imgFound })
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/poster/add", [
  body("title").matches(patterns.poster.title),
  body("content").matches(patterns.poster.content),
  body("link").matches(patterns.poster.link),
  validator,
], async (req, res) => {
  try {
    const author = await teacherModel.findOne({ id: req.loginId }, "_id");
    if (!author) {
      return res.status(500).json({
        error: "internal server error"
      });
    }

    const poster = new posterModel({
      title: req.body.title,
      content: req.body.content,
      link: req.body.link,
      registDate: new Date(),
      isShow: false,
      campus: req.campusId,
      author: author._id
    })
    const posterSaved = await poster.save();
    res.json({
      poster: posterSaved
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
})

router.post("/poster/img/upload", [
  body("id").isMongoId(),
  body("type").matches(patterns.imgType),
  validator,
  middlewareAuthPoster,
], async (req, res) => {
  try {
    const poster = await posterModel.findById(req.body.id, "_id");
    if (!poster) {
      return res.status(404).json({
        error: "no corresponding poster"
      });
    }

    const key = `posters/${ poster._id }`;
    const type = req.body.type;
    awsS3.getUploadPUrlPost(key, type, (err, data) => {
      if (err) {
        return res.status(500).json({
          error: "internal server error"
        });
      }
      data.fields["Content-Type"] = type;
      data.fields["key"] = key;
      res.json({
        url: data.url,
        fields: data.fields,
      })
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
})

module.exports = router;
