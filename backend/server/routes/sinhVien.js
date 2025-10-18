// import { Router } from 'express'
// import { getAll, getById, create, update, remove } from '../controllers/sinhVienController.js'
// import { uploadAvatar } from '../config/multer.js'
// const router = Router()

// router.get('/', getAll)
// router.get('/:id', getById)
// router.put('/:id', update) // ✅ cập nhật sinh viên
// router.delete('/:id', remove)
// router.post('/', uploadAvatar.single('anh_the'), create)

// export default router
import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/sinhVienController.js'

const router = Router()

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

export default router
