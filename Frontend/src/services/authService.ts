import axios from 'axios';
import useAuthStore from '../store/authStore';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/auth`;

const requestChangePasswordOtp = async () => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authenticated');
  const response = await axios.post(
    `${API_URL}/request-change-password-otp`,
    {},
    { headers: { 'x-auth-token': token } }
  );
  return response.data;
};

const changePasswordWithOtp = async (otp: string, newPassword: string) => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authenticated');
  const response = await axios.post(
    `${API_URL}/change-password-otp`,
    { otp, newPassword },
    { headers: { 'x-auth-token': token } }
  );
  return response.data;
};

const requestDeleteAccount = async (password: string) => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authenticated');
  const response = await axios.post(
    `${API_URL}/request-delete-account`,
    { password },
    { headers: { 'x-auth-token': token } }
  );
  return response.data;
};

const confirmDeleteAccount = async (otp: string) => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authenticated');
  const response = await axios.post(
    `${API_URL}/confirm-delete-account`,
    { otp },
    { headers: { 'x-auth-token': token } }
  );
  return response.data;
};


const register = async (userData: any) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const verifyOtp = async (email: string, otp: string) => {
  const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return response.data;
};

const login = async (userData: any) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data.token) {
    useAuthStore.getState().setToken(response.data.token, response.data.userId, response.data.username, response.data.email);
  }
  return response.data;
};

const forgotPassword = async (email: string) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

const resetPassword = async (resetData: any) => {
  const response = await axios.post(`${API_URL}/reset-password`, resetData);
  return response.data;
};


const changePassword = async (currentPassword: string, newPassword: string) => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authenticated');
  const response = await axios.post(
    `${API_URL}/change-password`,
    { currentPassword, newPassword },
    { headers: { 'x-auth-token': token } }
  );
  return response.data;
};

const logout = () => {
  useAuthStore.getState().logout();
};


const authService = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  requestChangePasswordOtp,
  changePasswordWithOtp,
  requestDeleteAccount,
  confirmDeleteAccount,
  logout,
};

export default authService;