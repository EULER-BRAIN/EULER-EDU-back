const express = require('express');
const { teacherModel } = require('../db/mongo');
const router = express.Router();

router.use(require('../middlewares/authTeacherCampus'));

router.post("/teacher", async (req, res) => {
  try {
    if (req.loginLevel != 'administrator' && req.loginLevel != 'director') {
      return res.status(402).json({
        error: "/management/campus/teacher : Permission denied"
      });
    }
    const teachers = await teacherModel.find({
      campus: req.campusId
    });
    res.json({ teachers });
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "/management/campus/teacher : internal server error"
    })
  }
})

module.exports = router;
