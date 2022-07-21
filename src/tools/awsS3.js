const env = require('./env');

// Load the AWS-SDK and s3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// list
/*s3.listObjects(env.aws.s3Bucket, (err, data) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
})*/
