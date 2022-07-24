const { validationResult } = require("express-validator");

module.exports = (cb) => (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      error: "validation : bad request",
    });
  }
  return cb(req, res);
}
