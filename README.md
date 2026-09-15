# DocShare

DocShare là hệ thống quản lý và chia sẻ học liệu số dành cho sinh viên, giảng viên và quản trị viên. Project sử dụng React + Vite cho frontend, Node.js + Express cho backend, MySQL/MariaDB cho dữ liệu và Cloudinary cho lưu trữ tài liệu.

## Chức năng chính

- Đăng ký, đăng nhập bằng JWT và phân quyền RBAC `student` / `teacher` / `admin`.
- Vai trò được đọc lại từ database ở mỗi request bảo vệ, nên thay đổi quyền có hiệu lực ngay cả với token cũ.
- Admin có thể khóa/mở khóa tài khoản; tài khoản bị khóa không thể đăng nhập và phiên JWT cũ cũng bị chặn.
- Khám phá, tìm kiếm và lọc học liệu theo danh mục.
- Xem chi tiết học liệu công khai; đăng nhập để lưu và tải xuống.
- Upload tài liệu với kiểm tra định dạng/kích thước và quy trình chờ duyệt.
- Admin duyệt hoặc từ chối tài liệu; khi từ chối bắt buộc nhập lý do, người đăng nhìn thấy phản hồi trong Profile.
- Bộ sưu tập tài liệu đã lưu và lịch sử tải xuống.
- Hồ sơ cá nhân, đổi mật khẩu, quản lý tài liệu đã đăng.
- Admin dashboard, kiểm duyệt tài liệu, quản lý người dùng, danh mục và toàn bộ học liệu.
- Audit Logs ghi nhận đăng ký/đăng nhập, khóa tài khoản, đổi role, upload, sửa, duyệt, từ chối, tải và xóa tài liệu.
- OpenAPI JSON và giao diện Swagger UI để kiểm tra REST API.
- Unit tests bằng Node.js native test runner và bộ E2E test chạy trực tiếp qua HTTP API.
- Giao diện responsive cho desktop, tablet và mobile.

## Chạy project local

### 1. Database

Import database hiện tại vào MySQL/MariaDB. Database mặc định là `hoc_lieu_so_db`.

Nếu database chưa từng được nâng cấp, chạy lần lượt:

```text
backend/database/migrate_demo_ready.sql
backend/database/migrate_enterprise_features.sql
```

Migration enterprise thêm:

- `users.is_active`, `users.locked_at`, `users.last_login_at`
- `documents.rejection_reason`, `documents.reviewed_by`, `documents.reviewed_at`
- bảng `audit_logs`

### 2. Backend

```bash
cd backend
npm install
```

Copy `.env.example` thành `.env` và cấu hình:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hoc_lieu_so_db
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Khởi động backend:

```bash
npm run dev
```

Các đường dẫn hữu ích:

- Health check: `http://localhost:5000/api/health`
- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/openapi.json`

> Swagger UI tải asset giao diện từ CDN. Nếu máy demo không có Internet, OpenAPI JSON vẫn hoạt động bình thường.

### 3. Frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Testing

### Unit tests

Không cần chạy server hoặc kết nối database thật:

```bash
cd backend
npm test
```

Unit suite kiểm tra validation, moderation workflow, JWT authentication, account lock và RBAC middleware.

### E2E tests

E2E suite gọi trực tiếp API đang chạy và tạo một tài khoản test tạm thời:

```bash
cd backend
npm run test:e2e
```

Mặc định test API tại `http://localhost:5000/api`. Có thể đổi bằng:

```powershell
$env:E2E_BASE_URL="http://localhost:5000/api"
```

Để test đầy đủ chức năng admin, khóa/mở khóa, đổi role, audit log và tự xóa tài khoản test sau khi chạy, cấu hình tài khoản admin hợp lệ trước khi chạy:

```powershell
$env:E2E_ADMIN_EMAIL="your-admin@example.com"
$env:E2E_ADMIN_PASSWORD="your-admin-password"
npm run test:e2e
```

Không ghi mật khẩu admin thật vào source code hoặc commit lên GitHub.

## Build production

```bash
cd frontend
npm run build
```

Backend production:

```bash
cd backend
npm start
```

## Luồng demo đề xuất

1. Đăng nhập Admin, mở Dashboard và Nhật ký hệ thống.
2. Mở Người dùng, đổi role hoặc khóa/mở khóa một tài khoản demo.
3. Đăng nhập tài khoản student/teacher và upload một học liệu.
4. Admin mở hàng đợi kiểm duyệt, thử từ chối kèm lý do để chứng minh moderation feedback.
5. Người đăng vào Profile để xem lý do từ chối, sửa tài liệu; hệ thống đưa tài liệu về trạng thái `pending`.
6. Admin duyệt lại; từ trang chủ tìm kiếm, xem chi tiết, lưu và tải tài liệu.
7. Quay lại Audit Logs để cho thấy các thao tác vừa thực hiện đã được ghi nhận.
8. Mở `/api/docs` để trình bày REST API và chạy `npm test` nếu cần chứng minh kiểm thử tự động.

## Bảo mật và dữ liệu

- Không commit file `.env` hoặc bất kỳ secret Cloudinary/JWT nào.
- Tài khoản mới luôn được tạo với vai trò `student`; chỉ admin được thay đổi role.
- Không thể tự hạ quyền, tự khóa hoặc tự xóa tài khoản admin đang đăng nhập.
- Hệ thống ngăn khóa/hạ quyền/xóa quản trị viên hoạt động cuối cùng.
- Tài khoản bị khóa bị chặn cả ở login và các request sử dụng JWT cũ.
- URL lưu trữ Cloudinary không được trả về trong API chi tiết tài liệu công khai; tải xuống đi qua endpoint có xác thực để ghi nhận lịch sử.
- Audit logging được thiết kế fail-safe: lỗi ghi log không làm hỏng thao tác nghiệp vụ chính.
- Cấu trúc `uploaded_by` và bảng `download_history` trong dump cũ là legacy; code hiện tại sử dụng `uploader_id` và bảng `downloads`.

## Repository

`https://github.com/ttunnanh/docshare`
