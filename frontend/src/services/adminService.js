import api from './api';
export const getDashboardStats=()=>api.get('/admin/stats').then(r=>r.data);
export const getAllUsers=()=>api.get('/admin/users').then(r=>r.data);
export const updateUserRole=(id,role)=>api.put(`/admin/users/${id}/role`,{role}).then(r=>r.data);
export const deleteUser=id=>api.delete(`/admin/users/${id}`).then(r=>r.data);
export const getPendingDocuments=()=>api.get('/admin/documents/pending').then(r=>r.data);
export const setDocumentStatus=(id,status)=>api.put(`/admin/documents/${id}/status`,{status}).then(r=>r.data);
