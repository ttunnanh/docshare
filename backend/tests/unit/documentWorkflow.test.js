const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRejectionReason, validateReviewInput } = require('../../utils/documentWorkflow');

test('approved review clears rejection reason', () => {
  assert.deepEqual(validateReviewInput('approved', 'old reason'), {
    ok: true,
    status: 'approved',
    rejectionReason: null,
  });
});

test('rejected review requires a useful reason', () => {
  const result = validateReviewInput('rejected', 'x');
  assert.equal(result.ok, false);
  assert.match(result.message, /lý do/i);
});

test('rejected review stores trimmed reason', () => {
  assert.deepEqual(validateReviewInput('rejected', '  Sai danh mục  '), {
    ok: true,
    status: 'rejected',
    rejectionReason: 'Sai danh mục',
  });
});

test('unknown status is rejected', () => {
  assert.equal(validateReviewInput('pending', '').ok, false);
});

test('rejection reason is capped at 500 characters', () => {
  assert.equal(normalizeRejectionReason('a'.repeat(800)).length, 500);
});
