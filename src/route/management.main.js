const express = require('express');
const awsS3 = require('../db/awsS3');
const router = express.Router();

router.get("/", (req, res) => {
  res.json({});
})

module.exports = router;
