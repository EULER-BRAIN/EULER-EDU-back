require("dotenv").config()

module.exports.port = {
  http: process.env.PORT_HTTP,
  https: process.env.PORT_HTTPS,
  dev: process.env.DEVELOP,
}

module.exports.mongo = {
  path: process.env.DB_PATH,
  databaseName: process.env.DB_DB,
}
module.exports.session = process.env.SESSION_KEY;

module.exports.aws = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3BucketName: process.env.AWS_S3_BUCKET_NAME,
}
