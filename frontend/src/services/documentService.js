import api from './api';

export const getDocuments = (params = {}) => api.get('/documents', { params }).then((r) => r.data);
export const getPublicStats = () => api.get('/documents/stats/public').then((r) => r.data);
export const getDocument = (id) => api.get(`/documents/${id}`).then((r) => r.data);
export const uploadDocument = (form) => api.post('/documents/upload', form).then((r) => r.data);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data).then((r) => r.data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`).then((r) => r.data);

const filenameFromDisposition = (value, id) => {
  if (!value) return `docshare-${id}`;
  const utf8 = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try { return decodeURIComponent(utf8[1]); } catch { return utf8[1]; }
  }
  const plain = value.match(/filename="?([^";]+)"?/i);
  return plain?.[1] || `docshare-${id}`;
};

export const downloadDocument = async (id) => {
  const response = await api.get(`/documents/${id}/stream`, {
    responseType: 'blob',
    timeout: 60000,
  });
  const filename = filenameFromDisposition(response.headers['content-disposition'], id);
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return { downloaded: true, filename };
};

export const toggleSave = (id) => api.post(`/documents/${id}/save`).then((r) => r.data);
export const getSaved = () => api.get('/documents/saved/user').then((r) => r.data);
export const getAllAdmin = () => api.get('/documents/admin/all').then((r) => r.data);
