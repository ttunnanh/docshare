const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: response.status, data };
}

test('DocShare live API E2E flow', async (t) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const email = `e2e-${suffix}@docshare.test`;
  const password = 'E2Epass123';
  let studentToken = '';
  let studentId = null;
  let adminToken = '';

  await t.test('health endpoint is available', async () => {
    const result = await request('/health');
    assert.equal(result.status, 200);
    assert.equal(result.data?.ok, true);
  });

  await t.test('new student can register', async () => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: { fullname: 'E2E Student', email, password },
    });
    assert.equal(result.status, 201);
  });

  await t.test('duplicate registration is rejected', async () => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: { fullname: 'E2E Student', email, password },
    });
    assert.equal(result.status, 409);
  });

  await t.test('wrong password is rejected', async () => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: { email, password: 'wrong-password' },
    });
    assert.equal(result.status, 401);
  });

  await t.test('student can log in', async () => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    assert.equal(result.status, 200);
    assert.ok(result.data?.token);
    assert.equal(result.data?.user?.role, 'student');
    studentToken = result.data.token;
    studentId = result.data.user.id;
  });

  await t.test('authenticated student can read and update profile', async () => {
    const profile = await request('/users/profile', { token: studentToken });
    assert.equal(profile.status, 200);
    assert.equal(profile.data?.email, email);

    const update = await request('/users/profile', {
      method: 'PUT',
      token: studentToken,
      body: { fullname: 'E2E Student Updated' },
    });
    assert.equal(update.status, 200);
  });

  await t.test('student cannot access admin endpoints', async () => {
    const result = await request('/admin/stats', { token: studentToken });
    assert.equal(result.status, 403);
  });

  await t.test('public catalog endpoints are reachable', async () => {
    const categories = await request('/categories');
    assert.equal(categories.status, 200);
    assert.ok(Array.isArray(categories.data));

    const documents = await request('/documents?limit=5');
    assert.equal(documents.status, 200);
    assert.ok(Array.isArray(documents.data?.documents));
  });

  await t.test('protected saved endpoint requires authentication', async () => {
    const result = await request('/documents/saved/user');
    assert.equal(result.status, 401);
  });

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    t.diagnostic('Admin E2E checks skipped. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to test role changes, lock/unlock and audit logs.');
    return;
  }

  await t.test('admin can log in', async () => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    assert.equal(result.status, 200);
    assert.equal(result.data?.user?.role, 'admin');
    adminToken = result.data.token;
  });

  await t.test('admin can change and restore a user role', async () => {
    const promote = await request(`/admin/users/${studentId}/role`, {
      method: 'PUT', token: adminToken, body: { role: 'teacher' },
    });
    assert.equal(promote.status, 200);

    const restore = await request(`/admin/users/${studentId}/role`, {
      method: 'PUT', token: adminToken, body: { role: 'student' },
    });
    assert.equal(restore.status, 200);
  });

  await t.test('admin lock immediately blocks login and existing token', async () => {
    const lock = await request(`/admin/users/${studentId}/status`, {
      method: 'PATCH', token: adminToken, body: { is_active: false },
    });
    assert.equal(lock.status, 200);

    const blockedLogin = await request('/auth/login', {
      method: 'POST', body: { email, password },
    });
    assert.equal(blockedLogin.status, 403);
    assert.equal(blockedLogin.data?.code, 'ACCOUNT_LOCKED');

    const blockedSession = await request('/users/profile', { token: studentToken });
    assert.equal(blockedSession.status, 403);
    assert.equal(blockedSession.data?.code, 'ACCOUNT_LOCKED');
  });

  await t.test('admin can unlock account', async () => {
    const unlock = await request(`/admin/users/${studentId}/status`, {
      method: 'PATCH', token: adminToken, body: { is_active: true },
    });
    assert.equal(unlock.status, 200);

    const loginAgain = await request('/auth/login', {
      method: 'POST', body: { email, password },
    });
    assert.equal(loginAgain.status, 200);
  });

  await t.test('audit log records administrative activity', async () => {
    const result = await request('/admin/audit-logs?limit=100', { token: adminToken });
    assert.equal(result.status, 200);
    assert.ok(Array.isArray(result.data?.items));
    const actions = result.data.items.map((item) => item.action);
    assert.ok(actions.includes('admin.user_locked'));
    assert.ok(actions.includes('admin.user_unlocked'));
  });

  await t.test('admin can clean up the E2E account', async () => {
    const result = await request(`/admin/users/${studentId}`, {
      method: 'DELETE', token: adminToken,
    });
    assert.equal(result.status, 200);
  });
});
