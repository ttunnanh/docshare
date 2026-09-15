const test = require('node:test');
const assert = require('node:assert/strict');
const { _private } = require('../../controllers/secureDownloadController');

test('Stream Guard builds safe downloadable filename', () => {
  assert.equal(_private.safeFilename('Mạng máy tính căn bản', 'PDF'), 'Mạng máy tính căn bản.pdf');
});

test('Stream Guard strips filesystem-hostile filename characters', () => {
  const filename = _private.safeFilename('Bài: 01 / TCP?*', 'DOCX');
  assert.equal(filename.includes('/'), false);
  assert.equal(filename.includes('?'), false);
  assert.equal(filename.endsWith('.docx'), true);
});

test('Stream Guard falls back when metadata is empty', () => {
  assert.equal(_private.safeFilename('', ''), 'document.file');
});
