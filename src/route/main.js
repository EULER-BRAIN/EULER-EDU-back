const express = require('express');
const { galleryModel, campusModel, awardModel, bookModel } = require("../db/mongo");
const { query, param, body } = require("express-validator");
const valid = require('../tools/valid');
const router = express.Router();

router.get("/", valid(async (req, res) => {
  try {
    const galleries = await galleryModel.find({ isShow: true }).sort({ modifyDate: -1 });
    const campuses = await campusModel.find({ isShow: true }, "id name subname").sort({ priority: -1 });
    const awards = await awardModel.find({ isShow: true }).sort({ registDate: -1 }).limit(9);
    const books = await bookModel.find({ isShow: true }).sort({ priority: -1 }).limit(4);
    return res.json({ galleries, campuses, awards, books });
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "main : internal server error"
    })
  }
}));

router.get("/:cid", valid(async (req, res) => {
  try {
    const campus = await campusModel.findOne({
      id: req.params.cid, isShow: true
    });

    if (!campus) {
      return res.status(403).json({
        error: "main/:cid : no corresponding campus"
      })
    }
    return res.json({ campus });
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "main/:cid : internal server error"
    })
  }
}));

router.get("/notice/:id", param("id").isMongoId(), valid((req, res) => {
  console.log(123);
}))

module.exports = router;
