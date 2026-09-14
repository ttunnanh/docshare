const multer = require('multer');

// Cấu hình lưu trữ file tạm thời trong bộ nhớ (RAM)
const storage = multer.memoryStorage();

// Bộ lọc định dạng chi tiết (Hỗ trợ PDF, Word, Excel, PowerPoint, Text, Zip)
const fileFilter = (req, file, cb) => {
    // Danh sách các MIME Type an toàn
    const allowedMimeTypes = [
        'application/pdf', // PDF
        'application/msword', // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'application/vnd.ms-powerpoint', // PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
        'application/vnd.ms-excel', // XLS
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
        'text/plain', // TXT
        'application/zip', // ZIP
        'application/x-zip-compressed',
        'application/x-rar-compressed' // RAR
    ];

    if (
        allowedMimeTypes.includes(file.mimetype) || 
        file.mimetype.includes('document') || 
        file.mimetype.includes('presentation') || 
        file.mimetype.includes('spreadsheet')
    ) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng file không được hỗ trợ. Chỉ cho phép PDF, Word, Excel, PowerPoint, TXT và ZIP/RAR.'), false);
    }
};

// Cấu hình Multer kèm giới hạn dung lượng (20MB) để tránh tràn bộ nhớ RAM (Memory Leak)
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // Giới hạn 20MB
});

module.exports = upload;