const { teacherModel, campusModel } = require('../db/mongo');

module.exports = async (req, res, next) => {
  try {
    let campusId = req.query.campus || req.body.campus;
    if (!campusId) {
      const teacher = await teacherModel.findOne({ id: req.loginId }, "campus");
      campusId = teacher?.campus;
    }
    if (!campusId) {
      return res.status(401).json({
        error: "permission denied"
      });
    }
  
    const campus = await campusModel.findById(campusId, "_id name");
    if (!campus) {
      return res.status(401).json({
        error: "permission denied"
      });
    }
  
    if (req.loginLevel != 'administrator') {
      const teacher = await teacherModel.findOne({ id: req.loginId }, "campus");
      if (teacher?.campus.toString() != campus._id.toString()) {
        return res.status(401).json({
          error: "permission denied"
        });
      }
    }
    req.campusId = campus._id;
    req.campusName = campus.name;
    next();
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
}
