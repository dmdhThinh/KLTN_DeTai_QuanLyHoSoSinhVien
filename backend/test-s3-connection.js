// Test S3 Connection
import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 Testing AWS S3 Connection...\n')

// Hiển thị config (ẩn một phần credentials)
console.log('📋 AWS Configuration:')
console.log('  Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + '...')
console.log('  Region:', process.env.AWS_REGION)
console.log('  Bucket Name:', process.env.AWS_BUCKET_NAME)
console.log()

// Tạo S3 instance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

// Test 1: List buckets
console.log('🧪 Test 1: Listing all buckets...')
try {
  const buckets = await s3.listBuckets().promise()
  console.log('✅ Success! Found', buckets.Buckets.length, 'bucket(s):')
  buckets.Buckets.forEach(bucket => {
    console.log('  -', bucket.Name)
  })
  console.log()
} catch (err) {
  console.error('❌ Failed to list buckets:', err.message)
  console.error('Error code:', err.code)
  process.exit(1)
}

// Test 2: Check specific bucket
const bucketName = process.env.AWS_BUCKET_NAME
console.log(`🧪 Test 2: Checking bucket "${bucketName}"...`)
try {
  await s3.headBucket({ Bucket: bucketName }).promise()
  console.log('✅ Bucket exists and is accessible')
  console.log()
} catch (err) {
  console.error('❌ Cannot access bucket:', err.message)
  console.error('Error code:', err.code)
  if (err.code === 'NotFound') {
    console.error('💡 Bucket does not exist. Please create it in AWS Console.')
  } else if (err.code === 'Forbidden') {
    console.error('💡 No permission to access bucket. Check IAM permissions.')
  }
  process.exit(1)
}

// Test 3: Try to upload a test file
console.log('🧪 Test 3: Uploading test file...')
try {
  const testKey = `test-upload-${Date.now()}.txt`
  const params = {
    Bucket: bucketName,
    Key: testKey,
    Body: 'This is a test upload',
    ContentType: 'text/plain',
    ACL: 'public-read'
  }
  
  const result = await s3.upload(params).promise()
  console.log('✅ Upload successful!')
  console.log('   File URL:', result.Location)
  console.log()
  
  // Clean up test file
  console.log('🧹 Cleaning up test file...')
  await s3.deleteObject({ Bucket: bucketName, Key: testKey }).promise()
  console.log('✅ Test file deleted')
  console.log()
} catch (err) {
  console.error('❌ Upload failed:', err.message)
  console.error('Error code:', err.code)
  if (err.code === 'AccessDenied') {
    console.error('💡 No permission to upload. Check IAM policy for s3:PutObject')
  }
  process.exit(1)
}

// Test 4: Check bucket policy
console.log('🧪 Test 4: Checking bucket policy...')
try {
  const policy = await s3.getBucketPolicy({ Bucket: bucketName }).promise()
  console.log('✅ Bucket has a policy configured')
  console.log()
} catch (err) {
  if (err.code === 'NoSuchBucketPolicy') {
    console.warn('⚠️  No bucket policy found')
    console.warn('💡 You may need to add a policy for public-read access')
    console.log()
  } else {
    console.error('❌ Cannot check policy:', err.message)
  }
}

console.log('✅ All tests completed successfully!')
console.log('🎉 AWS S3 is properly configured and working!')
