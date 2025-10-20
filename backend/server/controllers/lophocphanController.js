
import * as LopHocPhanModel from '../models/lopHocPhan.js';
// 🧩 Lấy danh sách lớp học phần (kèm môn & giảng viên)


export async function create(req, res) {
    try {
        const data = req.body;  // assuming data is sent via the request body
        const result = await LopHocPhanModel.createLopHocPhan(data);
        res.status(201).json({ message: 'Lớp học phần created successfully', data: result });
    } catch (err) {
        res.status(500).json({ message: 'Error creating LopHocPhan', error: err.message });
    }
}

export async function getAll(req, res) {
    try {
        const rows = await LopHocPhanModel.getAllLopHocPhan();
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching LopHocPhan list', error: err.message });
    }
}

export async function getById(req, res) {
    const { id } = req.params;
    try {
        const row = await LopHocPhanModel.getLopHocPhanById(id);
        if (!row) {
            return res.status(404).json({ message: 'Lớp học phần not found' });
        }
        res.status(200).json(row);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching LopHocPhan by ID', error: err.message });
    }
}

export async function update(req, res) {
    const { id } = req.params;
    const data = req.body;
    try {
        const result = await LopHocPhanModel.updateLopHocPhan(id, data);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lớp học phần not found' });
        }
        res.status(200).json({ message: 'Lớp học phần updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating LopHocPhan', error: err.message });
    }
}

export async function deleteLopHocPhan(req, res) {
    const { id } = req.params;
    try {
        const result = await LopHocPhanModel.deleteLopHocPhan(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lớp học phần not found' });
        }
        res.status(200).json({ message: 'Lớp học phần deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting LopHocPhan', error: err.message });
    }
}
