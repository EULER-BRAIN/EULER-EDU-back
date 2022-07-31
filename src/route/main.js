const express = require('express');
const { galleryModel, campusModel, awardModel, bookModel, noticeModel, teacherModel, posterModel } = require("../db/mongo");
const { query, param, body } = require("express-validator");
const validator = require('../middlewares/validator');
const trans = require('../tools/trans');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const galleries = await galleryModel.find({ isShow: true }).sort({ modifyDate: -1 });
    const campuses = await campusModel.find({ isShow: true }, "id name subname").sort({ priority: -1 });
    const awards = await awardModel.find({ isShow: true }).sort('-registDate').limit(9);
    const books = await bookModel.find({ isShow: true }).sort({ priority: -1 }).limit(4);
    return res.json({ galleries, campuses, awards, books });
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const campus = await campusModel.findOne({
      id: req.params.cid, isShow: true
    });
    if (!campus) {
      return res.status(404).json({
        error: "no corresponding campus"
      });
    }
    const notices = await noticeModel.find({
      campus: campus._id,
      isShow: true
    }, "_id title link modifyDate").sort("-modifyDate").limit(5);

    const posters = await posterModel.find({
      campus: campus._id,
      isShow: true
    }, "_id title content link registDate author").sort("-registDate").limit(20);

    return res.json({
      campus,
      notices,
      posters,
      dateNow: new Date()
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/award/list", [
  body("page").isInt({ min: 1 }),
  validator,
], async (req, res) => {
  try {
    const npp = 50;
    const page = req.body.page;
    let awardsAll = await awardModel.find({ isShow: true }, "_id");
    if (!awardsAll) awardsAll = [];
    const maxPage = trans.maxPage(awardsAll.length, npp);
    if (page > maxPage) {
      return res.status(416).json({
        error: "out of page scope"
      })
    }
    const awards = await awardModel.find({ isShow: true })
      .sort('-registDate').limit(npp).skip(npp*(page-1));
    res.json({
      awards,
      page,
      maxPage,
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.get("/award/content/:id", [
  param("id").isMongoId(),
  validator,
], async (req, res) => {
  try {
    const award = await awardModel.findById(req.params.id);
    if (!award || !award.isShow) {
      return res.status(404).json({
        error: "no corresponding award"
      });
    }
    const awardPrev = await awardModel.find({
      isShow: true,
      registDate: { $gt: award.registDate }
    }).sort('registDate').limit(1);
    const awardNext = await awardModel.find({
      isShow: true,
      registDate: { $lt: award.registDate }
    }).sort('-registDate').limit(1);
    
    res.json({
      award: award,
      awardPrev: awardPrev.length > 0 ? awardPrev[0] : null,
      awardNext: awardNext.length > 0 ? awardNext[0] : null,
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.post("/notice/list", [
  body("id").isString(),
  body("page").isInt({ min: 1 }),
  validator,
], async (req, res) => {
  try {
    const campus = await campusModel.findOne({ id: req.body.id }, "_id");
    if (!campus) {
      return res.status(404).json({
        error: "no corresponding campus"
      });
    }

    const npp = 50;
    const page = req.body.page;
    let noticeAll = await noticeModel.find({ isShow: true, campus: campus._id }, "_id");
    if (!noticeAll) noticeAll = [];
    const maxPage = trans.maxPage(noticeAll.length, npp);
    if (page > maxPage) {
      return res.status(416).json({
        error: "out of page scope"
      })
    }

    const notices = await noticeModel.find({
      isShow: true, campus: campus._id
    }, "_id title link modifyDate").sort("-modifyDate")
      .limit(npp).skip(npp*(page-1));
    const dateNow = new Date();
    
    res.json({
      notices,
      page,
      maxPage,
      dateNow,
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

router.get("/notice/content/:id", [
  param("id").isMongoId(),
  validator,
], async (req, res) => {
  try {
    const notice = await noticeModel.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({
        error: "no corresponding campus"
      });
    }
    if (!notice.isShow) {
      return res.status(404).json({
        error: "no corresponding campus"
      });
    }
    const teacher = await teacherModel.findById(notice.author, "_id id name campus");
    const campus = await campusModel.findById(notice.campus, "_id id name");
    if (!teacher || !campus) {
      return res.status(500).json({
        error: "internal server error"
      });
    }
    notice.author = teacher;
    notice.campus = campus;
    return res.json({
      notice: notice
    })
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

module.exports = router;
