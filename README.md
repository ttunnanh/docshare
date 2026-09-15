# DocShare

DocShare là hệ thống quản lý và chia sẻ học liệu số dành cho sinh viên, giảng viên và quản trị viên. Project sử dụng React + Vite cho frontend, Node.js + Express cho backend, MySQL/MariaDB cho dữ liệu và Cloudinary cho lưu trữ tài liệu.

## Chức năng chính

- Đăng ký, đăng nhập JWT và phân quyền RBAC `student` / `teacher` / `admin`.
- Vai trò được đọc lại từ database ở mỗi request bảo vệ, nên thay đổi quyền có hiệu lực ngay với cả token cũ.
- Admin có thể khóa/mở khóa tài khoản; tài khoản bị khóa không thể đăng nhập và phiên JWT hiện tại cũng bị vô hiệu hóa ở các endpoint bảo vệ.
- Khám phá, tìm kiếm, phân trang và lọc học liệu theo danh mục.
- Upload học liệu lên Cloudinary với kiểm tra định dạng/kích thước.
- Quy trình tài liệu đầy đủ: `draft -> pending -> approved/rejected`.
- Khi từ chối tài liệu, admin bắt buộc nhập lý do; chủ tài liệu xem phản hồi, chỉnh sửa rồi gửi duyệt lại.
- Tài liệu có thể được lưu vào thư viện cá nhân; hệ thống có lịch sử tải xuống.
- Tải file qua Stream Guard: backend xác thực người dùng, kiểm tra trạng thái, ghi lịch sử/lượt tải và stream file từ Cloudinary thay vì trả trực tiếp URL lưu trữ cho client.
- Hồ sơ cá nhân, đổi mật khẩu, quản lý tài liệu đã đăng.
- Admin Dashboard với KPI, quản lý người dùng, role, trạng thái tài khoản, danh mục và toàn bộ học liệu.
- Audit Logs ghi nhận đăng ký/đăng nhập, thay đổi role, khóa/mở khóa, tạo/lưu nháp, gửi duyệt, sửa, duyệt, từ chối, tải và xóa tài liệu.
- OpenAPI JSON + Swagger UI cho REST API.
- Unit tests bằng Node.js native test runner, live E2E tests qua HTTP và GitHub Actions CI.
- Giao diện responsive cho desktop, tablet và mobile.

## Yêu cầu môi trường

- Node.js 18 trở lên; khuyến nghị Node.js 20 LTS.
- MySQL hoặc MariaDB; project hiện dùng database `hoc_lieu_so_db`.
- Tài khoản Cloudinary hợp lệ để upload/tải tài liệu.
- Trình duyệt hiện đại như Chrome, Edge, Firefox hoặc Brave.

## Chạy project local

### 1. Database

Import database gốc/hiện tại vào MySQL hoặc MariaDB trước. Sau đó copy `backend/.env.example` thành `backend/.env` và cấu hình kết nối database.

Project có lệnh migration tự động, chạy hai migration theo đúng thứ tự:

```bash
cd backend
npm install
npm run migrate
```

`npm run migrate` chạy:

```text
backend/database/migrate_demo_ready.sql
backend/database/migrate_enterprise_features.sql
```

Migration enterprise bổ sung trạng thái tài khoản, workflow `draft/pending/approved/rejected`, metadata kiểm duyệt và bảng `audit_logs`.

### 2. Backend

File `.env` mẫu:

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
cd backend
npm run dev
```

Các địa chỉ hữu ích:

```text
API Health:    http://localhost:5000/api/health
Swagger UI:    http://localhost:5000/api/docs
OpenAPI JSON:  http://localhost:5000/api/openapi.json
```

Swagger UI tải asset giao diện từ CDN. Nếu máy demo không có Internet, API và OpenAPI JSON vẫn hoạt động bình thường.

### 3. Frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Truy cập:

```text
http://localhost:5173
```

## Testing

### Unit tests

Unit tests không cần chạy web server thật:

```bash
cd backend
npm test
```

Suite kiểm tra validation, moderation workflow, JWT authentication, role refresh, account lock, RBAC và helper của Stream Guard.

### E2E tests

Đầu tiên chạy backend ở một terminal:

```bash
cd backend
npm run dev
```

Ở terminal khác:

```bash
cd backend
npm run test:e2e
```

Mặc định E2E gọi `http://localhost:5000/api`. Có thể thay bằng biến môi trường `E2E_BASE_URL`.

Để chạy đầy đủ test quản trị, role, khóa/mở khóa và Audit Logs, khai báo tài khoản admin **chỉ trên máy local**, không commit mật khẩu vào source:

```powershell
$env:E2E_ADMIN_EMAIL="your-admin@example.com"
$env:E2E_ADMIN_PASSWORD="your-admin-password"
npm run test:e2e
```

Khi có admin credentials, E2E suite sẽ dọn tài khoản test tạm ở cuối luồng. Nếu không truyền admin credentials, các bước admin sẽ được bỏ qua và tài khoản test có thể còn lại trong database.

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

## CI

Workflow `.github/workflows/ci.yml` chạy tự động khi push vào `main`, branch `feature/**` hoặc mở Pull Request vào `main`:

- Backend: `npm ci` + `npm test`
- Frontend: `npm ci` + `npm run build`

E2E không chạy tự động trên CI vì cần MySQL, Cloudinary và tài khoản admin local; đây là bộ test chủ động trước khi merge/demo.

## Luồng demo đề xuất

1. Đăng nhập Admin, mở Dashboard và Nhật ký hệ thống.
2. Mở Người dùng, đổi role hoặc khóa/mở khóa một tài khoản demo.
3. Đăng nhập tài khoản thường, upload tài liệu và thử **Lưu bản nháp**.
4. Mở lại bản nháp, chỉnh sửa và **Gửi chờ duyệt**.
5. Admin từ chối tài liệu kèm lý do; người đăng vào Profile xem phản hồi.
6. Người đăng sửa tài liệu và gửi duyệt lại; Admin phê duyệt.
7. Từ trang chủ tìm kiếm, lưu và tải tài liệu qua Stream Guard.
8. Quay lại Audit Logs để cho thấy các thao tác vừa thực hiện đã được ghi nhận.
9. Mở `/api/docs` và chạy `npm test` để trình bày tài liệu API + kiểm thử tự động.

## Bảo mật và dữ liệu

- Không commit `.env`, JWT secret, Cloudinary secret hoặc mật khẩu tài khoản thật.
- Tài khoản mới luôn được tạo với role `student`; chỉ admin được thay đổi role.
- Role ở database được kiểm tra lại trên mỗi request bảo vệ; không tin hoàn toàn role cũ bên trong JWT.
- Không thể tự hạ quyền, tự khóa hoặc tự xóa admin đang đăng nhập.
- Hệ thống không cho khóa/hạ quyền/xóa quản trị viên hoạt động cuối cùng.
- Tài khoản bị khóa bị chặn cả ở login và các request dùng JWT cũ.
- API chi tiết công khai không trả `file_url` hoặc `cloudinary_public_id`.
- Frontend tải file qua endpoint Stream Guard có xác thực thay vì mở Cloudinary URL trực tiếp.
- Audit logging theo cơ chế fail-safe: nếu việc ghi log lỗi thì thao tác nghiệp vụ chính không bị làm hỏng.
- Cấu trúc `uploaded_by` và bảng `download_history` trong dump cũ là legacy; code hiện dùng `uploader_id` và bảng `downloads`.

## Repository

`https://github.com/ttunnanh/docshare`
