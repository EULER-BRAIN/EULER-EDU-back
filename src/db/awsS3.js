const env = require('../tools/env');

// Load the AWS-SDK and s3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// function to list Object
const getS3List = (cb) => {
  s3.listObjects({
    Bucket: env.aws.s3BucketName
  }, (err, data) => {
    cb(err, data);
  });
}

// function to generate signed-url for upload
const getUploadPUrl = (filePath) => {
  const presignedUrl = s3.getSignedUrl('putObject', {
    Bucket: env.aws.s3BucketName,
    Key: filePath,
    Expires: 60 // 1 min
  });
  return presignedUrl;
}

module.exports = { getS3List, getUploadPUrl }
