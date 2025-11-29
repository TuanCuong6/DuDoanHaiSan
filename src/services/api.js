import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://dhtbkc4.tbu.edu.vn/quanlytainguyen/api/express';

// Tạo instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// API không cần token (cho người dùng chưa đăng nhập)
const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor để tự động thêm token vào header
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
};

export const areasAPI = {
  getAll: () => {
    return publicApi.get('/areas/all');
  },
  getAllAreas: () => {
    return publicApi.get('/areas/all');
  },
  getById: id => {
    return publicApi.get(`/areas/area/${id}`);
  },
  create: areaData => {
    return api.post('/areas', areaData);
  },
  update: (id, areaData) => {
    return api.put(`/areas/${id}`, areaData);
  },
  delete: id => {
    return api.delete(`/areas/${id}`);
  },
  getProvinces: () => {
    return api.get('/areas/provinces');
  },
  getDistricts: () => {
    return api.get('/areas/districts');
  },
};

export const usersAPI = {
  getAll: () => {
    return api.get('/auth');
  },
  getById: id => {
    return api.get(`/auth/user/${id}`);
  },
  create: userData => {
    return api.post('/auth/create-user', userData);
  },
  update: (id, userData) => {
    return api.post(`/auth/update/${id}`, userData);
  },
  delete: id => {
    return api.delete(`/auth/delete/${id}`);
  },
  activate: id => {
    return api.patch(`/auth/activate/${id}`);
  },
  deactivate: id => {
    return api.patch(`/auth/deactivate/${id}`);
  },
  changePassword: (id, oldPassword, newPassword) => {
    return api.post(`/auth/change-password/${id}`, { oldPassword, newPassword });
  },
  getPaginated: (params) => {
    const { search = '', role = '', province = '', limit = 10, offset = 0 } = params;
    return api.get(`/auth/paginated?search=${search}&role=${role}&province=${province}&limit=${limit}&offset=${offset}`);
  },
};

export const emailAPI = {
  sendOTP: (email, area_id) => {
    return publicApi.post('/emails/send-otp', { email, area_id });
  },
  verifyOTP: (email, otp, area_id) => {
    return publicApi.post('/emails/verify-otp', { email, otp_code: otp, area_id });
  },
  getSubscribers: (area_id) => {
    return api.get(`/emails/area/${area_id}/subscribers`);
  },
  sendManual: (data) => {
    return api.post('/emails/send-manual', data);
  },
  getAll: (limit = 10, offset = 0) => {
    return api.get(`/emails?limit=${limit}&offset=${offset}`);
  },
  create: (data) => {
    return api.post('/emails/subscribe', data);
  },
  update: (id, data) => {
    return api.put(`/emails/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/emails/${id}`);
  },
  sendTest: (email) => {
    return api.post('/emails/test', { email });
  },
};

export const predictionsAPI = {
  getAll: (limit = 10, offset = 0) => {
    return api.get(`/predictions/admin?limit=${limit}&offset=${offset}`);
  },
  getById: (id) => {
    return api.get(`/predictions/${id}`);
  },
  getLatestByArea: (areaId) => {
    return publicApi.get(`/predictions/${areaId}/latest`);
  },
};

export const expertPredictionsAPI = {
  getByUser: (userId, limit = 10, offset = 0) => {
    return api.get(`/predictions/user/${userId}?limit=${limit}&offset=${offset}`);
  },
  getById: (id) => {
    return api.get(`/predictions/${id}`);
  },
  create: (data) => {
    return api.post('/predictions', data);
  },
  uploadExcel: (formData) => {
    return api.post('/predictions/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 giây cho upload file
    });
  },
  uploadExcel2: (formData) => {
    return api.post('/predictions/excel2', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 giây cho upload file
    });
  },
  batch: (data) => {
    return api.post('/predictions/batch', data, {
      timeout: 120000, // 120 giây cho batch prediction
    });
  },
};

export const jobsAPI = {
  getAll: (limit = 10, offset = 0) => {
    return api.get(`/jobs?limit=${limit}&offset=${offset}`);
  },
};

export default api;
