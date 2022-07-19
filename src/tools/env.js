require("dotenv").config()

module.exports.port = {
  http: process.env.PORT_HTTP,
  https: process.env.PORT_HTTPS
}

module.exports.mongo = process.env.DB_PATH;
module.exports.session = process.env.SESSION_KEY;
