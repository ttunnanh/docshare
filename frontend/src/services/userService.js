import api from './api';
export const getProfile=()=>api.get('/users/profile').then(r=>r.data);
export const getUploads=()=>api.get('/users/uploads').then(r=>r.data);
export const getDownloads=()=>api.get('/users/downloads').then(r=>r.data);
export const updateProfile=fullname=>api.put('/users/profile',{fullname}).then(r=>r.data);
export const changePassword=(oldPassword,newPassword)=>api.put('/users/password',{oldPassword,newPassword}).then(r=>r.data);
