const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const { verifyToken, verifyRole } = require('../../middlewares/authMiddleware');

process.env.JWT_SECRET = 'docshare-unit-test-secret';

const originalExecute = db.execute.bind(db);

const makeReq = (token = null) => ({
  get(name) {
    if (name === 'Authorization' && token) return `Bearer ${token}`;
    return undefined;
  },
});

const makeRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

test.afterEach(() => {
  db.execute = originalExecute;
});

test('verifyToken rejects requests without bearer token', async () => {
  const req = makeReq();
  const res = makeRes();
  let nextCalled = false;
  await verifyToken(req, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('verifyToken rejects invalid JWT', async () => {
  const req = makeReq('invalid-token');
  const res = makeRes();
  await verifyToken(req, res, () => assert.fail('next must not run'));
  assert.equal(res.statusCode, 401);
});

test('verifyToken loads current database role instead of stale token role', async () => {
  const token = jwt.sign({ id: 7, role: 'student' }, process.env.JWT_SECRET);
  db.execute = async () => [[{ id: 7, role: 'admin', is_active: 1 }]];
  const req = makeReq(token);
  const res = makeRes();
  let nextCalled = false;

  await verifyToken(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: 7, role: 'admin' });
  assert.equal(res.statusCode, 200);
});

test('verifyToken blocks a locked account even with a valid JWT', async () => {
  const token = jwt.sign({ id: 9 }, process.env.JWT_SECRET);
  db.execute = async () => [[{ id: 9, role: 'student', is_active: 0 }]];
  const req = makeReq(token);
  const res = makeRes();

  await verifyToken(req, res, () => assert.fail('locked account must not continue'));

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, 'ACCOUNT_LOCKED');
});

test('verifyToken rejects token whose user has been deleted', async () => {
  const token = jwt.sign({ id: 99 }, process.env.JWT_SECRET);
  db.execute = async () => [[]];
  const req = makeReq(token);
  const res = makeRes();

  await verifyToken(req, res, () => assert.fail('deleted user must not continue'));

  assert.equal(res.statusCode, 401);
});

test('verifyRole allows matching role', () => {
  const req = { user: { id: 1, role: 'admin' } };
  const res = makeRes();
  let nextCalled = false;
  verifyRole(['admin'])(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test('verifyRole rejects non-matching role', () => {
  const req = { user: { id: 2, role: 'student' } };
  const res = makeRes();
  verifyRole(['admin'])(req, res, () => assert.fail('student must not pass admin middleware'));
  assert.equal(res.statusCode, 403);
});
