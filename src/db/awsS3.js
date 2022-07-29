const env = require('../tools/env');

// Load the AWS-SDK and s3
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-2',
  signatureVersion: 'v4',
});
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// function to list Object
const getS3List = (directoryPath, cb) => {
  s3.listObjects({
    Bucket: env.aws.s3BucketName,
    Prefix: directoryPath
  }, (err, data) => {
    cb(err, data);
  });
}

// function to generate signed-url for upload(PUT)
const getUploadPUrlPut = (filePath, fileType='image/png') => {
  const presignedUrl = s3.getSignedUrl('putObject', {
    Bucket: env.aws.s3BucketName,
    Key: filePath,
    ContentType: fileType,
    ACL: 'public-read',
    Expires: 60, // 1 min
  });
  return presignedUrl;
}

// function to generate signed-url for upload(POST)
const getUploadPUrlPost = (filePath, fileType, cb) => {
  s3.createPresignedPost(
    {
      Bucket: env.aws.s3BucketName,
      Expires: 60, // 1 min
      Conditions: [
        { key: filePath },
        { acl: 'public-read' },
        ["eq", "$Content-Type", fileType],
        ["content-length-range", 1, 10 * 1024 * 1024], // Maximum file size is 10MB
      ],
      Fields: {
        acl: "public-read",
      }
    },
    (err, data) => {
      cb(err, data);
    }
  );
};

// function to delete object
const deleteObject = (filePath, cb) => {
  s3.deleteObject({
    Bucket: env.aws.s3BucketName,
    Key: filePath,
  }, (err, data) => {
    cb(err, data);
  });
}

// function to check exist of Object
const foundObject = (filePath, cb) => {
  s3.headObject({
    Bucket: env.aws.s3BucketName,
    Key: filePath,
  }, (err, data) => {
    cb(err, data);
  })
}

module.exports = { getS3List, getUploadPUrlPut, getUploadPUrlPost, deleteObject, foundObject }
