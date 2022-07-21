const express = require('express');
const router = express.Router();

router.use(require('../middlewares/authTeacher')());
router.use('/main', require('./management.main'));

module.exports = router;
