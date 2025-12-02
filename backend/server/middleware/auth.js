import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt.js';

// Middleware để xác thực JWT và lấy thông tin user
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Thiếu token xác thực' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      sv: decoded.sv || null,
      gv: decoded.gv || null
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

// Middleware kiểm tra quyền admin
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa xác thực' });
  }
  
  if (req.user.role !== 'Quản trị') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền thực hiện thao tác này' });
  }
  
  next();
}

