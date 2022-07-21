const { teacherModel, campusModel } = require('../db/mongo');

module.exports = async (req, res, next) => {
  try {
    let campusId = req.query.campus || req.body.campus;
    if (!campusId) {
      const teacher = await teacherModel.findOne({ id: req.loginId }, "campus");
      campusId = teacher?.campus;
    }
    if (!campusId) {
      return res.status(402).json({
        error: "authTeacherCampus : Permission denied"
      });
    }
  
    const campus = await campusModel.findById(campusId, "_id name");
    if (!campus) {
      return res.status(402).json({
        error: "authTeacherCampus : Permission denied"
      });
    }
  
    if (req.loginLevel != 'administrator') {
      const teacher = await teacherModel.findOne({ id: req.loginId }, "campus");
      if (teacher?.campus != campus._id) {
        return res.status(402).json({
          error: "authTeacherCampus : Permission denied"
        });
      }
    }
    req.campusId = campus._id;
    req.campusName = campus.name;
    next();
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "authTeacherCampus : internal server error"
    })
  }
}
