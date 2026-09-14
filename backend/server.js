const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Nạp biến môi trường
dotenv.config();

// Khởi tạo DB connection 
require('./config/db');

// Nhúng các route
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ==========================================
// CẤU HÌNH MIDDLEWARE
// ==========================================
app.use(helmet()); 
app.use(morgan('dev')); 
app.use(cors()); 
app.use(express.json()); 

// ==========================================
// KÍCH HOẠT CÁC ENDPOINT API
// ==========================================

// Phục vụ các file tĩnh 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Đăng ký các router
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// ROUTE MẶC ĐỊNH & KHỞI CHẠY SERVER
// ==========================================
app.get('/', (req, res) => {
    res.send('API Backend Hệ thống DocShare đang hoạt động');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server chạy tại: http://localhost:${PORT}`);
});