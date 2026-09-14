# DocShare – Demo Ready

Bản sửa tập trung vào việc làm project chạy ổn định cho demo với MySQL + Node.js + React + Cloudinary.

## 1. Cập nhật database hiện tại

Mở phpMyAdmin > database `hoc_lieu_so_db` > tab SQL, chạy file:

`backend/database/migrate_demo_ready.sql`

Migration này giữ nguyên dữ liệu hiện tại, đồng bộ `status`, thêm `downloads` và `cloudinary_public_id`.

## 2. Backend

```bash
cd backend
npm install
```

Copy `.env.example` thành `.env`, điền Cloudinary và đổi `JWT_SECRET`.

```bash
npm run dev
```

API: `http://localhost:5000/api`
Health check: `http://localhost:5000/api/health`

## 3. Frontend

Mở terminal khác:

```bash
cd frontend
npm install
```

Có thể copy `.env.example` thành `.env` (localhost mặc định đã đúng).

```bash
npm run dev
```

Mở `http://localhost:5173`

## 4. Luồng demo gợi ý

1. Login admin.
2. Mở Dashboard để cho thấy thống kê.
3. Login/đăng ký student, upload một file.
4. Admin vào "Chờ duyệt" và duyệt file.
5. Student tìm tài liệu, xem chi tiết, lưu và tải xuống.
6. Mở Profile để cho thấy tài liệu đã đăng + lịch sử tải.
7. Admin trình diễn quản lý user, role, category và tài liệu.

## Lưu ý database cũ

- `documents.uploaded_by` và `download_history` là cấu trúc legacy; code mới dùng `uploader_id` và `downloads`.
- Tài khoản sample ID 1–3 trong dump có chuỗi bcrypt giả (`$2a$10$X...`) nên không đăng nhập được. Dùng tài khoản thật ID 4/5 hoặc tạo tài khoản mới.
