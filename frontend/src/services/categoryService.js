import api from './api';
export const getCategories=()=>api.get('/categories').then(r=>r.data);
export const createCategory=name=>api.post('/categories',{name}).then(r=>r.data);
export const updateCategory=(id,name)=>api.put(`/categories/${id}`,{name}).then(r=>r.data);
export const deleteCategory=id=>api.delete(`/categories/${id}`).then(r=>r.data);
