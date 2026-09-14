const multer = require('multer');

// Cấu hình lưu trữ file tạm thời trong bộ nhớ (RAM)
const storage = multer.memoryStorage();

// Bộ lọc định dạng (Chỉ cho phép PDF, Word, PowerPoint)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.includes('document') || 
        file.mimetype.includes('presentation')) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng file không được hỗ trợ. Vui lòng tải lên định dạng văn bản.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;