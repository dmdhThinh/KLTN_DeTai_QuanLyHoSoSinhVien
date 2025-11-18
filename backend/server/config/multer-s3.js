// server/config/multer-s3.js
import multer from 'multer'
import multerS3 from 'multer-s3'
import { s3, S3_BUCKET } from './s3.js'
import path from 'path'

console.log('🔧 Multer-S3 Config:', {
  bucket: S3_BUCKET,
  hasS3: !!s3
})

// Helper function để sanitize filename
function sanitizeFilename(filename) {
  // Loại bỏ ký tự tiếng Việt và đặc biệt, chỉ giữ a-z, A-Z, 0-9, dấu gạch ngang, gạch dưới
  return filename
    .normalize('NFD') // Tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Đổi đ thành d
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Thay ký tự đặc biệt bằng _
    .replace(/_+/g, '_') // Gộp nhiều _ thành 1
    .replace(/^_|_$/g, '') // Xóa _ ở đầu/cuối
}

// Cấu hình multer-s3 để upload ảnh thẻ sinh viên
export const uploadStudentPhoto = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    acl: 'public-read', // Bật lại vì bucket đã enable ACLs
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Tạo tên file unique: student-photos/maSv-timestamp.ext
      const maSv = req.body.ma_sv || req.params.id || 'unknown'
      const sanitized = sanitizeFilename(file.originalname)
      const ext = path.extname(sanitized)
      const fileName = `student-photos/${maSv}-${Date.now()}${ext}`
      console.log('📝 Generated S3 key:', fileName)
      cb(null, fileName)
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })
    
    // Chỉ cho phép upload ảnh
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      console.log('✅ File accepted')
      cb(null, true)
    } else {
      console.log('❌ File rejected - invalid mimetype')
      cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'), false)
    }
  }
})

// Cấu hình multer-s3 để upload ảnh thẻ giảng viên
export const uploadTeacherPhoto = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Tạo tên file unique: teacher-photos/maGv-timestamp.ext
      const maGv = req.body.ma_gv || req.params.id || 'unknown'
      const sanitized = sanitizeFilename(file.originalname)
      const ext = path.extname(sanitized)
      const fileName = `teacher-photos/${maGv}-${Date.now()}${ext}`
      console.log('📝 Generated S3 key:', fileName)
      cb(null, fileName)
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })
    
    // Chỉ cho phép upload ảnh
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      console.log('✅ File accepted')
      cb(null, true)
    } else {
      console.log('❌ File rejected - invalid mimetype')
      cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'), false)
    }
  }
})

// Cấu hình multer-s3 cho upload file thông báo (ảnh, video, tệp đính kèm)
export const uploadThongBaoFiles = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Tạo folder dựa vào loại file
      let folder = 'thong-bao/'
      
      if (file.fieldname === 'hinh_anh') {
        folder += 'images/'
      } else if (file.fieldname === 'video') {
        folder += 'videos/'
      } else if (file.fieldname === 'tep_dinh_kem') {
        folder += 'attachments/'
      }
      
      // Sanitize filename để loại bỏ tiếng Việt và ký tự đặc biệt
      const sanitized = sanitizeFilename(file.originalname)
      const fileName = `${folder}${Date.now()}-${sanitized}`
      console.log('📝 Generated S3 key for thông báo:', fileName)
      console.log('   Original:', file.originalname, '→ Sanitized:', sanitized)
      cb(null, fileName)
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // giới hạn 100MB cho video
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter thông báo:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    })
    
    // Cho phép ảnh, video và các file đính kèm
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    const allowedDocMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    
    if (file.fieldname === 'hinh_anh' && allowedImageMimes.includes(file.mimetype)) {
      console.log('✅ Image file accepted')
      cb(null, true)
    } else if (file.fieldname === 'video' && allowedVideoMimes.includes(file.mimetype)) {
      console.log('✅ Video file accepted')
      cb(null, true)
    } else if (file.fieldname === 'tep_dinh_kem' && (allowedImageMimes.includes(file.mimetype) || allowedVideoMimes.includes(file.mimetype) || allowedDocMimes.includes(file.mimetype))) {
      console.log('✅ Attachment file accepted')
      cb(null, true)
    } else {
      console.log('❌ File rejected - invalid mimetype')
      cb(new Error(`File không hợp lệ: ${file.originalname}`), false)
    }
  }
})
