const multer = require('multer');
const allowed = new Set([
  'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain',
  'application/zip','application/x-zip-compressed','application/vnd.rar','application/x-rar-compressed'
]);
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => allowed.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Chỉ hỗ trợ PDF, Word, Excel, PowerPoint, TXT, ZIP/RAR.'))
});
