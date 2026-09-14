# DocShare

DocShare là hệ thống quản lý và chia sẻ học liệu số dành cho sinh viên, giảng viên và quản trị viên. Project sử dụng React + Vite cho frontend, Node.js + Express cho backend, MySQL/MariaDB cho dữ liệu và Cloudinary cho lưu trữ tài liệu.

## Chức năng chính

- Đăng ký, đăng nhập và phân quyền `student` / `teacher` / `admin`.
- Khám phá, tìm kiếm và lọc học liệu theo danh mục.
- Xem chi tiết học liệu công khai; đăng nhập để lưu và tải xuống.
- Upload tài liệu với kiểm tra định dạng/kích thước và quy trình chờ duyệt.
- Bộ sưu tập tài liệu đã lưu và lịch sử tải xuống.
- Hồ sơ cá nhân, đổi mật khẩu, quản lý tài liệu đã đăng.
- Admin dashboard, kiểm duyệt tài liệu, quản lý người dùng, danh mục và toàn bộ học liệu.
- Giao diện responsive cho desktop, tablet và mobile.

## Chạy project local

### 1. Database

Import database hiện tại, sau đó chạy migration:

```text
backend/database/migrate_demo_ready.sql
```

Database mặc định: `hoc_lieu_so_db`.

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

Health check: `http://localhost:5000/api/health`

### 3. Frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:5173`.

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

1. Đăng nhập admin và mở Dashboard.
2. Tạo/kiểm tra danh mục và người dùng.
3. Đăng nhập student, upload một học liệu.
4. Admin mở hàng đợi kiểm duyệt và phê duyệt.
5. Từ trang chủ tìm kiếm, xem chi tiết, lưu và tải tài liệu.
6. Mở Profile để trình bày tài liệu đã đăng và lịch sử tải.

## Bảo mật và dữ liệu

- Không commit file `.env` hoặc bất kỳ secret Cloudinary/JWT nào.
- Tài khoản mới luôn được tạo với vai trò `student`; chỉ admin được thay đổi role.
- URL lưu trữ Cloudinary không được trả về trong API chi tiết tài liệu công khai; tải xuống đi qua endpoint có xác thực để ghi nhận lịch sử.
- Cấu trúc `uploaded_by` và bảng `download_history` trong dump cũ là legacy; code hiện tại sử dụng `uploader_id` và bảng `downloads`.

## Repository

`https://github.com/ttunnanh/docshare`
