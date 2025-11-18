// server/controllers/thongBaoController.js
import { getAllThongBao, createThongBao } from '../models/thongBao.js'
import { pool } from '../config/db.js'
import { uploadThongBaoFiles } from '../config/multer-s3.js'
import { s3, S3_BUCKET } from '../config/s3.js'

export const upload = uploadThongBaoFiles

// Helper function để xóa file từ S3
async function deleteFileFromS3(fileUrl) {
  if (!fileUrl) return
  try {
    // Extract key từ URL
    const key = fileUrl.split('.com/')[1]
    if (!key) return
    
    await s3.deleteObject({
      Bucket: S3_BUCKET,
      Key: key
    }).promise()
    
    console.log('🗑️ Deleted from S3:', key)
  } catch (err) {
    console.error('❌ Error deleting from S3:', err)
  }
}


// ✅ Lấy danh sách tin tức kèm trạng thái đọc của sinh viên hoặc giảng viên
export async function getThongBao(req, res) {
  try {
    const { sinhVienId, giangVienId } = req.query || {}
    
    let sql, params
    
    if (giangVienId) {
      // Query cho giảng viên
      sql = `
        SELECT tb.*, 
               CASE 
                 WHEN td.da_doc = 'Đã đọc' THEN 'Đã đọc'
                 ELSE 'Chưa đọc'
               END AS da_doc
        FROM ThongBao tb
        LEFT JOIN ThongBao_DaDoc td
          ON tb.id = td.thong_bao_id AND td.giang_vien_id = ?
        ORDER BY tb.ngay_gui DESC
      `
      params = [giangVienId]
    } else {
      // Query cho sinh viên (default)
      sql = `
        SELECT tb.*, 
               CASE 
                 WHEN td.da_doc = 'Đã đọc' THEN 'Đã đọc'
                 ELSE 'Chưa đọc'
               END AS da_doc
        FROM ThongBao tb
        LEFT JOIN ThongBao_DaDoc td
          ON tb.id = td.thong_bao_id AND td.sinh_vien_id = ?
        ORDER BY tb.ngay_gui DESC
      `
      params = [sinhVienId || null]
    }
    
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi lấy tin tức:', err)
    res.status(500).json({ message: 'Không thể tải danh sách tin tức' })
  }
}

// ✅ Thêm tin tức (có nhiều ảnh)
export async function addThongBao(req, res) {
  try {
    const { tieu_de, noi_dung, mo_ta_file } = req.body
    if (!tieu_de || !noi_dung)
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung' })

    // Lấy S3 URLs từ multer-s3
    const video = req.files?.video?.[0]?.location || null
    const tep_dinh_kem = req.files?.tep_dinh_kem?.[0]?.location || null
    
    // Lưu tên file gốc - fix encoding lỗi từ multer
    let ten_file_goc = req.files?.tep_dinh_kem?.[0]?.originalname || null
    if (ten_file_goc) {
      try {
        // Decode từ latin1 sang UTF-8
        ten_file_goc = Buffer.from(ten_file_goc, 'latin1').toString('utf8')
      } catch (e) {
        console.warn('⚠️ Không decode được filename:', e.message)
      }
    }

    const [result] = await pool.query(
      `INSERT INTO ThongBao (tieu_de, noi_dung, video, tep_dinh_kem, mo_ta_file, ten_file_goc)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tieu_de, noi_dung, video, tep_dinh_kem, mo_ta_file || null, ten_file_goc]
    )

    const thongBaoId = result.insertId

    // Upload ảnh lên S3 và lưu URLs
    if (req.files?.hinh_anh?.length) {
      const values = req.files.hinh_anh.map((f) => [thongBaoId, f.location])
      await pool.query('INSERT INTO ThongBao_Anh (thong_bao_id, duong_dan) VALUES ?', [values])
    }

    res.json({ message: 'Đăng tin tức thành công!', id: thongBaoId })
  } catch (err) {
    console.error('❌ Lỗi thêm tin tức:', err)
    res.status(500).json({ message: 'Không thể thêm tin tức' })
  }
}


// ✅ Lấy chi tiết tin có nhiều ảnh
export async function getThongBaoById(req, res) {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM ThongBao WHERE id = ?', [id])
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tin tức' })

    const [anh] = await pool.query('SELECT duong_dan FROM ThongBao_Anh WHERE thong_bao_id = ?', [id])
    const tin = { ...rows[0], hinh_anh: anh.map((a) => a.duong_dan) }
    res.json(tin)
  } catch (err) {
    console.error('❌ Lỗi lấy chi tiết tin:', err)
    res.status(500).json({ message: 'Không thể lấy chi tiết tin tức' })
  }
}

// ✅ Cập nhật tin tức
export async function updateThongBao(req, res) {
  try {
    const { id } = req.params
    const { tieu_de, noi_dung, mo_ta_file, keep_images, delete_video, delete_file } = req.body
    if (!tieu_de || !noi_dung)
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung' })

    // Lấy thông tin cũ để xóa file S3
    const [oldData] = await pool.query('SELECT video, tep_dinh_kem FROM ThongBao WHERE id=?', [id])
    const oldRecord = oldData[0]

    // Lấy S3 URLs mới từ multer-s3
    const video = req.files?.video?.[0]?.location || null
    const tep_dinh_kem = req.files?.tep_dinh_kem?.[0]?.location || null
    
    // Lưu tên file gốc - fix encoding lỗi từ multer
    let ten_file_goc = req.files?.tep_dinh_kem?.[0]?.originalname || null
    if (ten_file_goc) {
      try {
        // Decode từ latin1 sang UTF-8
        ten_file_goc = Buffer.from(ten_file_goc, 'latin1').toString('utf8')
      } catch (e) {
        console.warn('⚠️ Không decode được filename:', e.message)
      }
    }

    // Xóa file cũ từ S3 nếu có file mới hoặc user muốn xóa
    if (video && oldRecord?.video) {
      await deleteFileFromS3(oldRecord.video)
    } else if (delete_video === 'true' && oldRecord?.video) {
      await deleteFileFromS3(oldRecord.video)
    }
    
    if (tep_dinh_kem && oldRecord?.tep_dinh_kem) {
      await deleteFileFromS3(oldRecord.tep_dinh_kem)
    } else if (delete_file === 'true' && oldRecord?.tep_dinh_kem) {
      await deleteFileFromS3(oldRecord.tep_dinh_kem)
    }

    // Cập nhật database - chỉ update field nào có giá trị mới
    const updateFields = []
    const updateValues = []
    
    updateFields.push('tieu_de=?', 'noi_dung=?', 'mo_ta_file=?')
    updateValues.push(tieu_de, noi_dung, mo_ta_file || null)
    
    if (video) {
      updateFields.push('video=?')
      updateValues.push(video)
    } else if (delete_video === 'true') {
      updateFields.push('video=?')
      updateValues.push(null)
    }
    
    if (tep_dinh_kem) {
      updateFields.push('tep_dinh_kem=?', 'ten_file_goc=?')
      updateValues.push(tep_dinh_kem, ten_file_goc)
    } else if (delete_file === 'true') {
      updateFields.push('tep_dinh_kem=?', 'ten_file_goc=?')
      updateValues.push(null, null)
    }
    
    updateValues.push(id)
    
    await pool.query(
      `UPDATE ThongBao SET ${updateFields.join(', ')} WHERE id=?`,
      updateValues
    )

    // Xử lý ảnh
    if (req.files?.hinh_anh?.length) {
      // Có ảnh mới → xóa toàn bộ ảnh cũ
      const [oldImages] = await pool.query('SELECT duong_dan FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
      for (const img of oldImages) {
        await deleteFileFromS3(img.duong_dan)
      }
      await pool.query('DELETE FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
      
      // Thêm ảnh mới
      const values = req.files.hinh_anh.map((f) => [id, f.location])
      await pool.query('INSERT INTO ThongBao_Anh (thong_bao_id, duong_dan) VALUES ?', [values])
    } else if (keep_images) {
      // Không có ảnh mới nhưng có keep_images → user đã xóa một số ảnh
      const keepList = JSON.parse(keep_images)
      
      // Lấy tất cả ảnh hiện tại
      const [oldImages] = await pool.query('SELECT duong_dan FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
      
      // Tìm ảnh nào bị xóa
      const deletedImages = oldImages.filter(img => !keepList.includes(img.duong_dan))
      
      // Xóa từ S3
      for (const img of deletedImages) {
        await deleteFileFromS3(img.duong_dan)
      }
      
      // Xóa từ DB
      if (deletedImages.length > 0) {
        const deleteUrls = deletedImages.map(img => img.duong_dan)
        await pool.query('DELETE FROM ThongBao_Anh WHERE thong_bao_id=? AND duong_dan IN (?)', [id, deleteUrls])
      }
    }

    res.json({ message: 'Cập nhật tin tức thành công!' })
  } catch (err) {
    console.error('❌ Lỗi cập nhật tin tức:', err)
    res.status(500).json({ message: 'Không thể cập nhật tin tức' })
  }
}

// ✅ Download file với tên gốc (có dấu tiếng Việt)
export async function downloadFile(req, res) {
  try {
    const { id } = req.params
    
    // Lấy thông tin thông báo
    const [rows] = await pool.query('SELECT tep_dinh_kem, ten_file_goc, mo_ta_file FROM ThongBao WHERE id=?', [id])
    if (!rows.length || !rows[0].tep_dinh_kem) {
      return res.status(404).json({ message: 'Không tìm thấy file' })
    }
    
    const { tep_dinh_kem, ten_file_goc, mo_ta_file } = rows[0]
    
    // Ưu tiên: tên file gốc > mô tả file > tên từ URL
    let downloadName = ten_file_goc
    if (!downloadName && mo_ta_file) {
      const urlParts = tep_dinh_kem.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const extension = fileName.includes('.') ? fileName.split('.').pop() : 'file'
      downloadName = `${mo_ta_file}.${extension}`
    }
    if (!downloadName) {
      const urlParts = tep_dinh_kem.split('/')
      downloadName = urlParts[urlParts.length - 1]
    }
    
    // Tạo presigned URL với response-content-disposition
    const key = tep_dinh_kem.split('.com/')[1]
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: 60, // 60 seconds
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`
    })
    
    res.redirect(signedUrl)
  } catch (err) {
    console.error('❌ Lỗi download file:', err)
    res.status(500).json({ message: 'Không thể download file' })
  }
}

// ✅ Xóa tin tức
export async function deleteThongBao(req, res) {
  try {
    const { id } = req.params
    
    // Lấy thông tin file để xóa từ S3
    const [thongbao] = await pool.query('SELECT video, tep_dinh_kem FROM ThongBao WHERE id=?', [id])
    const [images] = await pool.query('SELECT duong_dan FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
    
    // Xóa tất cả file từ S3
    if (thongbao[0]?.video) {
      await deleteFileFromS3(thongbao[0].video)
    }
    if (thongbao[0]?.tep_dinh_kem) {
      await deleteFileFromS3(thongbao[0].tep_dinh_kem)
    }
    for (const img of images) {
      await deleteFileFromS3(img.duong_dan)
    }
    
    // Xóa database records theo thứ tự (foreign key constraints)
    // 1. Xóa trạng thái đọc của sinh viên
    await pool.query('DELETE FROM ThongBao_DaDoc WHERE thong_bao_id=?', [id])
    // 2. Xóa ảnh đính kèm
    await pool.query('DELETE FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
    // 3. Xóa thông báo chính
    await pool.query('DELETE FROM ThongBao WHERE id=?', [id])
    
    res.json({ message: 'Đã xóa tin tức và tất cả file đính kèm' })
  } catch (err) {
    console.error('❌ Lỗi xóa tin tức:', err)
    res.status(500).json({ message: 'Không thể xóa tin tức', error: err.message })
  }
}