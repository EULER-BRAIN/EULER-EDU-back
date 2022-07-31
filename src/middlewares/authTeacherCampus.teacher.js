const { teacherModel } = require('../db/mongo');

module.exports = async (req, res, next) => {
  try {
    const teacherId = req.body.id || req.query.id || req.params.id;
    const teacher = await teacherModel.findOne({
      id: teacherId,
    }, "_id campus");
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
      if (teacherId != req.loginId) {
        return res.status(401).json({
          error: "permission denied"
        });
      }
    }

    next();
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error"
    });
  }
}
