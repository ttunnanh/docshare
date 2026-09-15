const { isValidReviewStatus } = require('./validation');

function normalizeRejectionReason(value) {
  return String(value || '').trim().slice(0, 500);
}

function validateReviewInput(status, rejectionReason) {
  const normalizedStatus = String(status || '').trim();
  const reason = normalizeRejectionReason(rejectionReason);

  if (!isValidReviewStatus(normalizedStatus)) {
    return { ok: false, message: 'Trạng thái không hợp lệ.' };
  }

  if (normalizedStatus === 'rejected' && reason.length < 3) {
    return { ok: false, message: 'Vui lòng nhập lý do từ chối tối thiểu 3 ký tự.' };
  }

  return {
    ok: true,
    status: normalizedStatus,
    rejectionReason: normalizedStatus === 'rejected' ? reason : null,
  };
}

module.exports = { normalizeRejectionReason, validateReviewInput };
