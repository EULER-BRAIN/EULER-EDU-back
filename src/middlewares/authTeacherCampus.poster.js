const { teacherModel, posterModel } = require('../db/mongo');

module.exports = async (req, res, next) => {
  try {
    const teacher = await teacherModel.findOne({
      id: req.loginId
    }, "_id");
    if (!teacher) {
      return res.status(500).json({
        error: "internal server error"
      })
    }

    const posterId = req.body.id || req.query.id || req.params.id;
    const poster = await posterModel.findById(posterId, "author");
    if (!poster) {
      return res.status(404).json({
        error: "no corresponding poster"
      })
    }

    if (req.loginLevel != 'administrator' && req.loginLevel == 'director') {
      if (poster.author.toString() != teacher._id.toString()) {
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
    })
  }
}
