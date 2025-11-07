import AWS from 'aws-sdk'

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1'
})

export const S3_BUCKET = process.env.AWS_BUCKET_NAME
