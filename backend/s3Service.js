const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;

// Upload Single file to S3
exports.s3Uploadv2 = async (file) => {
  const s3 = new S3();
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuid()}-${file.originalname}`,
    Body: file.buffer,
  };
  return await s3.upload(param).promise();
};

// Upload Multiple file to S3
exports.s3Uploadsv2 = async (files) => {
  const s3 = new S3();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(
    params.map((param) => s3.upload(param).promise())
  );
};
