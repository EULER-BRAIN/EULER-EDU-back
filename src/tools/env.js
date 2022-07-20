require("dotenv").config()

module.exports.port = {
  http: process.env.PORT_HTTP,
  https: process.env.PORT_HTTPS,
  dev: process.env.DEVELOP,
}

module.exports.mongo = process.env.DB_PATH;
module.exports.session = process.env.SESSION_KEY;
