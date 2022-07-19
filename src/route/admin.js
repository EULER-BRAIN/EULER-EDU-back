const express = require('express');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const { galleryModel, campusModel, awardModel, bookModel } = require("../db/mongo");

// Registration of the mongoose adapter
const AdminJSMongoose = require('@adminjs/mongoose');
AdminJS.registerAdapter(AdminJSMongoose);

// create router
const router = express.Router();
router.use(require("../middlewares/adminJs"));

const adminJs = new AdminJS({
  rootPath: '/admin',
  resources: [
    galleryModel,
    campusModel,
    awardModel,
    bookModel
  ]
});

module.exports = AdminJSExpress.buildRouter(adminJs, router);