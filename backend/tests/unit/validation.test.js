const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeEmail,
  isEmail,
  isValidRole,
  isValidReviewStatus,
  isStrongEnoughPassword,
  positiveInt,
} = require('../../utils/validation');

test('normalizeEmail trims and lowercases', () => {
  assert.equal(normalizeEmail('  USER@Example.COM '), 'user@example.com');
});

test('isEmail accepts normal email and rejects malformed value', () => {
  assert.equal(isEmail('student@nttu.edu.vn'), true);
  assert.equal(isEmail('student-at-nttu'), false);
});

test('role validation only accepts RBAC roles', () => {
  assert.equal(isValidRole('student'), true);
  assert.equal(isValidRole('teacher'), true);
  assert.equal(isValidRole('admin'), true);
  assert.equal(isValidRole('superadmin'), false);
});

test('review status validation only accepts approved/rejected', () => {
  assert.equal(isValidReviewStatus('approved'), true);
  assert.equal(isValidReviewStatus('rejected'), true);
  assert.equal(isValidReviewStatus('pending'), false);
});

test('password minimum rule is enforced', () => {
  assert.equal(isStrongEnoughPassword('123456'), true);
  assert.equal(isStrongEnoughPassword('12345'), false);
});

test('positiveInt applies fallback and maximum', () => {
  assert.equal(positiveInt('7', 1, 50), 7);
  assert.equal(positiveInt('-1', 3, 50), 3);
  assert.equal(positiveInt('999', 3, 50), 50);
  assert.equal(positiveInt('abc', 4, 50), 4);
});
