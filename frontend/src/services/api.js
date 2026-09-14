import axios from 'axios';

// Khởi tạo cấu hình mặc định cho Axios
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Đường dẫn tới Backend của bạn
});

// Interceptor: Tự động đính kèm Token vào mỗi Request gửi đi
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;