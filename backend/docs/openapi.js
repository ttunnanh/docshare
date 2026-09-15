const spec = {
  openapi: '3.0.3',
  info: {
    title: 'DocShare API',
    version: '1.1.0',
    description: 'REST API cho hệ thống quản lý và chia sẻ học liệu số DocShare.',
  },
  servers: [{ url: 'http://localhost:5000/api', description: 'Local development' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullname', 'email', 'password'],
        properties: {
          fullname: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: { summary: 'Health check', responses: { 200: { description: 'API is healthy' } } },
    },
    '/auth/register': {
      post: {
        summary: 'Đăng ký tài khoản sinh viên',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { 201: { description: 'Đăng ký thành công' }, 409: { description: 'Email đã tồn tại' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Đăng nhập',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { 200: { description: 'JWT + user' }, 401: { description: 'Sai thông tin đăng nhập' }, 403: { description: 'Tài khoản bị khóa' } },
      },
    },
    '/categories': {
      get: { summary: 'Danh sách danh mục', responses: { 200: { description: 'Danh mục + số tài liệu' } } },
    },
    '/documents': {
      get: {
        summary: 'Danh sách tài liệu đã duyệt',
        parameters: [
          { in: 'query', name: 'keyword', schema: { type: 'string' } },
          { in: 'query', name: 'category_id', schema: { type: 'integer' } },
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: { 200: { description: 'Danh sách phân trang' } },
      },
    },
    '/documents/upload': {
      post: {
        summary: 'Tải học liệu lên và gửi chờ duyệt',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, category_id: { type: 'integer' }, file: { type: 'string', format: 'binary' } }, required: ['title', 'file'] } } } },
        responses: { 201: { description: 'Upload thành công' }, 401: { description: 'Chưa đăng nhập' } },
      },
    },
    '/documents/{id}/download': {
      get: {
        summary: 'Tải tài liệu và ghi lịch sử',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Download URL' }, 404: { description: 'Tài liệu không tồn tại/chưa duyệt' } },
      },
    },
    '/users/profile': {
      get: { summary: 'Hồ sơ cá nhân', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Profile' } } },
      put: { summary: 'Cập nhật hồ sơ', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/stats': {
      get: { summary: 'KPI quản trị', security: [{ bearerAuth: [] }], responses: { 200: { description: 'System KPIs' }, 403: { description: 'Admin only' } } },
    },
    '/admin/users/{id}/status': {
      patch: {
        summary: 'Khóa/mở khóa tài khoản',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { is_active: { type: 'boolean' } }, required: ['is_active'] } } } },
        responses: { 200: { description: 'Account status updated' }, 403: { description: 'Admin only' } },
      },
    },
    '/admin/documents/{id}/status': {
      put: {
        summary: 'Duyệt hoặc từ chối tài liệu',
        description: 'Khi status=rejected, rejection_reason là bắt buộc.',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['approved', 'rejected'] }, rejection_reason: { type: 'string', maxLength: 500 } }, required: ['status'] } } } },
        responses: { 200: { description: 'Moderation updated' }, 400: { description: 'Invalid review input' } },
      },
    },
    '/admin/audit-logs': {
      get: {
        summary: 'Tra cứu nhật ký hệ thống',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'action', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', maximum: 100 } },
        ],
        responses: { 200: { description: 'Paginated audit events' }, 403: { description: 'Admin only' } },
      },
    },
  },
};

module.exports = spec;
