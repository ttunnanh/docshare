const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/db');
const path = require('path');

// Nhúng các route
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

// Cấu hình Middleware
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan('dev')); // Ghi nhật ký request
app.use(cors());
app.use(express.json());

// Kích hoạt các endpoints API
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));

app.get('/', (req, res) => {
    res.send('API Backend Hệ thống Học liệu số đang hoạt động');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server chạy tại: http://localhost:${PORT}`);
});