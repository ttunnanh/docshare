import api from './api';

// ==========================================
// QUẢN LÝ DANH MỤC (API SERVICES)
// ==========================================

// Lấy danh sách toàn bộ danh mục (Public)
export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

// Thêm danh mục mới (Yêu cầu quyền Admin)
export const createCategory = async (name) => {
    const response = await api.post('/categories', { name });
    return response.data;
};

// Cập nhật tên danh mục (Yêu cầu quyền Admin)
export const updateCategory = async (id, name) => {
    const response = await api.put(`/categories/${id}`, { name });
    return response.data;
};

// Xóa danh mục (Yêu cầu quyền Admin)
export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};