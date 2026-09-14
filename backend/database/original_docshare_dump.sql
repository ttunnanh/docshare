-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th9 14, 2026 lúc 04:40 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `hoc_lieu_so_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Công nghệ phần mềm', 'Tài liệu liên quan đến quy trình phát triển PM'),
(2, 'Trí tuệ nhân tạo', 'Tài liệu Machine Learning, Deep Learning'),
(3, 'Toán cao cấp', 'Đại số tuyến tính, giải tích');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_type` varchar(20) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `uploader_id` int(11) NOT NULL,
  `file_format` varchar(10) DEFAULT 'PDF',
  `rating` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `documents`
--

INSERT INTO `documents` (`id`, `title`, `description`, `file_url`, `file_type`, `category_id`, `uploaded_by`, `status`, `created_at`, `uploader_id`, `file_format`, `rating`) VALUES
(2, 'quy định đồ án 1', 'hướng dẫn làm đồ án 1', 'https://res.cloudinary.com/jdfqqhht/raw/upload/v1789286577/wjfo1hzabeciimwizmld', NULL, 1, NULL, 'approved', '2026-09-13 08:02:58', 5, 'PDF', 0),
(4, 'tài liệu 1', 'thực hành', 'https://res.cloudinary.com/jdfqqhht/raw/upload/v1789298630/xom6snhcwxcserjvmw5s', NULL, NULL, NULL, 'approved', '2026-09-13 11:23:50', 4, 'PDF', 0),
(5, 'tài liệu 2', 'lý thuyết 2', 'https://res.cloudinary.com/jdfqqhht/raw/upload/v1789311248/pscjgkzexopp2lfrtj68', NULL, 3, NULL, 'approved', '2026-09-13 14:54:08', 4, 'PDF', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `downloads`
--

CREATE TABLE `downloads` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `downloaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `downloads`
--

INSERT INTO `downloads` (`id`, `user_id`, `document_id`, `downloaded_at`) VALUES
(1, 5, 2, '2026-09-13 11:29:25'),
(2, 5, 4, '2026-09-13 11:29:31'),
(3, 5, 4, '2026-09-13 11:29:35'),
(4, 4, 2, '2026-09-13 11:29:55'),
(5, 4, 2, '2026-09-13 11:36:00'),
(6, 4, 4, '2026-09-13 11:36:04'),
(7, 4, 2, '2026-09-13 11:36:06'),
(8, 4, 2, '2026-09-13 13:21:57'),
(9, 5, 5, '2026-09-13 18:17:14'),
(10, 5, 5, '2026-09-14 09:17:07'),
(11, 5, 5, '2026-09-14 09:17:15');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `download_history`
--

CREATE TABLE `download_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `action_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `saved_documents`
--

CREATE TABLE `saved_documents` (
  `user_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `saved_documents`
--

INSERT INTO `saved_documents` (`user_id`, `document_id`, `created_at`) VALUES
(4, 5, '2026-09-14 14:10:44'),
(5, 4, '2026-09-14 09:49:10'),
(5, 5, '2026-09-14 09:49:06');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `role`, `created_at`, `avatar`) VALUES
(1, 'Admin System', 'admin@gmail.com', '$2a$10$X...mã_hóa_bcrypt...Y', 'admin', '2026-09-12 19:17:03', NULL),
(2, 'Giảng viên A', 'teacher@gmail.com', '$2a$10$X...mã_hóa_bcrypt...Y', 'teacher', '2026-09-12 19:17:03', NULL),
(3, 'Sinh viên B', 'student@gmail.com', '$2a$10$X...mã_hóa_bcrypt...Y', 'student', '2026-09-12 19:17:03', NULL),
(4, 'Tran Tuan Anh', 'anhtran112004@gmail.com', '$2b$10$05BtX7JYCyhZfx/.jFjE6OsdEro99qDX2dX.7V9J3BeN1VjbMeZeu', 'student', '2026-09-12 20:23:34', NULL),
(5, 'Quản trị viên', 'admin123@gmail.com', '$2b$10$AJRCkGR7N/Ohy87FQCsieOGzfW214AHxzQvZXrBcoXsIJ3vDEVEFe', 'admin', '2026-09-12 21:30:51', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Chỉ mục cho bảng `downloads`
--
ALTER TABLE `downloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `document_id` (`document_id`);

--
-- Chỉ mục cho bảng `download_history`
--
ALTER TABLE `download_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `document_id` (`document_id`);

--
-- Chỉ mục cho bảng `saved_documents`
--
ALTER TABLE `saved_documents`
  ADD PRIMARY KEY (`user_id`,`document_id`),
  ADD KEY `document_id` (`document_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `downloads`
--
ALTER TABLE `downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `download_history`
--
ALTER TABLE `download_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `downloads`
--
ALTER TABLE `downloads`
  ADD CONSTRAINT `downloads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `downloads_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `download_history`
--
ALTER TABLE `download_history`
  ADD CONSTRAINT `download_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `download_history_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `saved_documents`
--
ALTER TABLE `saved_documents`
  ADD CONSTRAINT `saved_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_documents_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
