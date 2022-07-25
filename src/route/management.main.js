const express = require('express');
const awsS3 = require('../db/awsS3');
const { awardModel } = require('../db/mongo');
const { query, param, body } = require("express-validator");
const validator = require('../middlewares/validator');
const patterns = require('../db/regExpPatterns');
const router = express.Router();

router.use(require('../middlewares/authTeacher')('administrator'));

router.get("/award", async (req, res) => {
  try {
    const awards = await awardModel.find().sort('-registDate isShow');
    if (!awards) {
      return res.status(401).json({
        error: "management/main/award : internal server error"
      })
    }
    awsS3.getS3List('awards/', (err, awardsS3) => {
      if (err) {
        return res.status(401).json({
          error: "management/main/award : internal server error"
        })
      }
      const imgList = [];
      const imgCheck = {};
      awardsS3.Contents.forEach(item => {
        if (!item.Key.startsWith('awards/')) return;
        if (!item.Key.endsWith('.png')) return;
        imgList.push(item.Key.slice(7, -4))
      })
      const ret = awards.map(item => {
        const id = item._id.toString();
        const isImg = (imgList.indexOf(id) != -1 ? true : false);
        if (isImg) imgCheck[id] = true;
        return {
          _id: id,
          name: item.name,
          content: item.content,
          isShow: item.isShow,
          isImg: isImg,
          registDate: item.registDate
        }
      })
      imgList.forEach(item => {
        if (!imgCheck[item]) {
          ret.push({
            _id: item,
            name: 'S3-Contra',
            content: 'DB에 등록되어 있지 않은 이미지가 S3에 저장되어 있습니다.',
            isShow: false,
            isImg: true,
            registDate: new Date()
          })
        }
      })
      return res.json({
        awards: ret
      })
    })
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award : internal server error"
    })
  }
})

router.get("/award/info/:id", [
  param("id").isMongoId(),
], validator, async (req, res) => {
  try {
    const id = req.params.id;
    const award = await awardModel.findById(id);
    if (!award) {
      return res.status(403).json({
        error: "management/main/award/info/:id : no corresponding teacher"
      })
    }
    awsS3.foundObject(`awards/${ award._id }.png`, (err, data) => {
      const imgFound = (err ? false : true);
      res.json({ award, imgFound })
    })
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/info/:id : internal server error"
    })
  }
});

router.post("/award/edit/name", [
  body("id").isMongoId(),
  body("name").matches(patterns.award.name),
], validator, async (req, res) => {
  try {
    const award = await awardModel.findOneAndUpdate({
      _id: req.body.id
    }, {
      name: req.body.name
    }, {
      new: true
    });
    res.json({
      award: award
    });
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/edit/name : internal server error"
    })
  }
});

router.post("/award/edit/content", [
  body("id").isMongoId(),
  body("content").matches(patterns.award.content),
], validator, async (req, res) => {
  try {
    const award = await awardModel.findOneAndUpdate({
      _id: req.body.id
    }, {
      content: req.body.content
    }, {
      new: true
    });
    res.json({
      award: award
    });
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/edit/content : internal server error"
    })
  }
});

router.post("/award/edit/isShow", [
  body("id").isMongoId(),
  body("isShow").isBoolean(),
], validator, async (req, res) => {
  try {
    const award = await awardModel.findOneAndUpdate({
      _id: req.body.id
    }, {
      isShow: req.body.isShow
    }, {
      new: true
    });
    res.json({
      award: award
    });
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/edit/isShow : internal server error"
    })
  }
});

router.get("/award/img/delete/:id", [
  param("id").isMongoId(),
], validator, async (req, res) => {
  try {
    const id = req.params.id;
    const award = await awardModel.findById(id);
    if (!award) {
      return res.status(403).json({
        error: "management/main/award/img/delete/:id : no corresponding teacher"
      })
    }
    awsS3.deleteObject(`awards/${ award._id }.png`, (err, data) => {
      if (err) {
        return res.status(401).json({
          error: "management/main/award/img/delete/:id : internal server error"
        })
      }
      res.json({
        award
      })
    })
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/img/delete/:id : internal server error"
    })
  }
});

router.get("/award/delete/:id", [
  param("id").isMongoId(),
], validator, async (req, res) => {
  try {
    await awardModel.findByIdAndDelete({ _id: req.params.id });
    res.json({
      result: true
    })
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/delete/:id : internal server error"
    })
  }
});

module.exports = router;
