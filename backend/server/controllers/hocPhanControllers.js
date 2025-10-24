import * as HocPhanModel from '../models/hocPhan.js'

// ➕ Create
export async function create(req, res) {
  try {
    const data = req.body
    const result = await HocPhanModel.createHocPhan(data)
    res.status(201).json({ message: 'Học phần created successfully', data: result })
  } catch (err) {
    res.status(500).json({ message: 'Error creating HocPhan', error: err.message })
  }
}

// 📜 Get all
export async function getAll(req, res) {
  try {
    const rows = await HocPhanModel.getAllHocPhan()
    res.status(200).json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching HocPhan list', error: err.message })
  }
}

// 🔍 Get by ID
export async function getById(req, res) {
  const { id } = req.params
  try {
    const row = await HocPhanModel.getHocPhanById(id)
    if (!row) return res.status(404).json({ message: 'Học phần not found' })
    res.status(200).json(row)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching HocPhan by ID', error: err.message })
  }
}

//  Update
export async function update(req, res) {
  const { id } = req.params
  const data = req.body
  try {
    const result = await HocPhanModel.updateHocPhan(id, data)
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Học phần not found' })
    res.status(200).json({ message: 'Học phần updated successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error updating HocPhan', error: err.message })
  }
}

// ❌ Delete
export async function deleteHocPhan(req, res) {
  const { id } = req.params
  try {
    const result = await HocPhanModel.deleteHocPhan(id)
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Học phần not found' })
    res.status(200).json({ message: 'Học phần deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting HocPhan', error: err.message })
  }
}
