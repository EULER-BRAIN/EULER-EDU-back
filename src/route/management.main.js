const express = require('express');
const awsS3 = require('../db/awsS3');
const { awardModel } = require('../db/mongo');
const { query, param, body } = require("express-validator");
const validator = require('../middlewares/validator');
const patterns = require('../db/regExpPatterns');
const trans = require('../tools/trans');
const router = express.Router();

router.use(require('../middlewares/authTeacher')('administrator'));

router.post("/award", [
  body("page").isInt({ min: 1 })
], validator, async (req, res) => {
  try {
    const npp = 50;
    const page = req.body.page;
    let awardsAll = await awardModel.find({}, "_id");
    if (!awardsAll) awardsAll = [];
    const maxPage = trans.maxPage(awardsAll.length, npp);
    if (page > maxPage) {
      return res.status(404).json({
        error: "management/main/award : out of page scope"
      })
    }
    const awards = await awardModel.find()
      .sort('-registDate').limit(npp).skip(npp*(page-1));
    awsS3.getS3List('awards/', (err, awardsS3) => {
      if (err) {
        return res.status(401).json({
          error: "management/main/award : internal server error"
        })
      }
      const imgList = [];
      awardsS3.Contents.forEach(item => {
        if (!item.Key.startsWith('awards/')) return;
        if (item.Key == 'awards/') return;
        imgList.push(item.Key.slice(7, -4))
      })
      const ret = awards.map(item => {
        const id = item._id.toString();
        const isImg = (imgList.indexOf(id) != -1 ? true : false);
        return {
          _id: id,
          name: item.name,
          content: item.content,
          isShow: item.isShow,
          isImg: isImg,
          registDate: item.registDate
        }
      })
      /*imgList.forEach(item => {
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
      })*/
      return res.json({
        awards: ret,
        page: page,
        maxPage: maxPage
      })
    })
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award : internal server error"
    })
  }
});

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
    awsS3.foundObject(`awards/${ award._id }`, (err, data) => {
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

router.post("/award/add", [
  body("name").matches(patterns.award.name),
  body("content").matches(patterns.award.content),
], validator, async (req, res) => {
  try {
    const award = new awardModel({
      name: req.body.name,
      content: req.body.content,
      isShow: false,
      registDate: new Date(),
    })
    const awardSaved = await award.save();
    res.json({
      award: awardSaved
    })
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/add : internal server error"
    })
  }
})

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
    awsS3.deleteObject(`awards/${ award._id }`, (err, data) => {
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

router.post("/award/img/upload", [
  body("id").isMongoId(),
  body("type").matches(patterns.imgType),
], validator, async (req, res) => {
  try {
    const award = await awardModel.findById(req.body.id);
    if (!award) {
      return res.status(403).json({
        error: "management/main/award/img/upload : no corresponding award"
      })
    }
    
    const key = `awards/${ award._id }`;
    const type = req.body.type;
    awsS3.getUploadPUrlPost(key, type, (err, data) => {
      if (err) {
        return res.status(500).json({
          error: "internal server error"
        })
      }
      data.fields["Content-Type"] = type;
      data.fields["key"] = key;
      res.json({
        url: data.url,
        fields: data.fields,
      })
    })
  }
  catch(e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award/img/upload : internal server error"
    })
  }
})

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
