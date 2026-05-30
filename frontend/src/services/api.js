import axios from 'axios';

const ACCOUNT_API = 'http://localhost:8081/api';
const CARD_API = 'http://localhost:8082/api';
const LOAN_API = 'http://localhost:8083/api';

// Global timeout
axios.defaults.timeout = 30000;

// Attach JWT token to every request
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const handleResponse = (res) => res.data;

export const authAPI = {
  // Step 1: validate credentials → returns { status: "OTP_REQUIRED", username }
  login: (username, password) =>
    axios.post(`${ACCOUNT_API}/auth/login`, { username, password }),

  // Step 2: generate OTP → returns { message, devOtp }
  sendOtp: (username, phone) =>
    axios.post(`${ACCOUNT_API}/auth/send-otp`, { username, phone }),

  // Step 3: verify OTP → returns { token, username, role }
  verifyOtp: (username, otp) =>
    axios.post(`${ACCOUNT_API}/auth/verify-otp`, { username, otp }),
};

// ========================
// Admin API
// ========================
export const adminAPI = {
  getProfile: () =>
    axios.get(`${ACCOUNT_API}/auth/me`),

  changePassword: (currentPassword, newPassword) =>
    axios.put(`${ACCOUNT_API}/auth/change-password`, { currentPassword, newPassword }),

  listUsers: () =>
    axios.get(`${ACCOUNT_API}/auth/users`),

  updateUserRole: (id, role) =>
    axios.put(`${ACCOUNT_API}/auth/users/${id}/role`, { role }),
};

// ========================
// Account Service API
// ========================
export const accountAPI = {
  getAll: (page = 0, size = 10, sort = 'createdAt') =>
    axios.get(`${ACCOUNT_API}/accounts`, { params: { page, size, sort } }).then(handleResponse),

  search: (query, page = 0, size = 10) =>
    axios.get(`${ACCOUNT_API}/accounts/search`, { params: { query, page, size } }).then(handleResponse),

  getById: (id) =>
    axios.get(`${ACCOUNT_API}/accounts/${id}`).then(handleResponse),

  getByNumber: (accountNumber) =>
    axios.get(`${ACCOUNT_API}/accounts/number/${accountNumber}`).then(handleResponse),

  create: (data) =>
    axios.post(`${ACCOUNT_API}/accounts`, data).then(handleResponse),

  deposit: (accountNumber, amount, description) =>
    axios.post(`${ACCOUNT_API}/accounts/${accountNumber}/deposit`, null, {
      params: { amount, description }
    }).then(handleResponse),

  withdraw: (accountNumber, amount, description) =>
    axios.post(`${ACCOUNT_API}/accounts/${accountNumber}/withdraw`, null, {
      params: { amount, description }
    }).then(handleResponse),

  updateStatus: (id, status) =>
    axios.patch(`${ACCOUNT_API}/accounts/${id}/status`, null, { params: { status } }).then(handleResponse),

  getTransactions: (accountNumber, page = 0, size = 20) =>
    axios.get(`${ACCOUNT_API}/accounts/${accountNumber}/transactions`, { params: { page, size } }).then(handleResponse),

  getDashboardStats: () =>
    axios.get(`${ACCOUNT_API}/accounts/stats/dashboard`).then(handleResponse),
};

// ========================
// Card Service API
// ========================
export const cardAPI = {
  getAll: (page = 0, size = 10) =>
    axios.get(`${CARD_API}/cards`, { params: { page, size } }).then(handleResponse),

  search: (query, page = 0, size = 10) =>
    axios.get(`${CARD_API}/cards/search`, { params: { query, page, size } }).then(handleResponse),

  getById: (id) =>
    axios.get(`${CARD_API}/cards/${id}`).then(handleResponse),

  getByAccount: (accountNumber) =>
    axios.get(`${CARD_API}/cards/account/${accountNumber}`).then(handleResponse),

  getByType: (cardType, page = 0, size = 10) =>
    axios.get(`${CARD_API}/cards/type/${cardType}`, { params: { page, size } }).then(handleResponse),

  block: (id) =>
    axios.post(`${CARD_API}/cards/${id}/block`).then(handleResponse),

  unblock: (id) =>
    axios.post(`${CARD_API}/cards/${id}/unblock`).then(handleResponse),

  getTransactions: (cardNumber, page = 0, size = 20) =>
    axios.get(`${CARD_API}/cards/${cardNumber}/transactions`, { params: { page, size } }).then(handleResponse),

  getDashboardStats: () =>
    axios.get(`${CARD_API}/cards/stats/dashboard`).then(handleResponse),
};

// ========================
// Loan Service API
// ========================
export const loanAPI = {
  getAll: (page = 0, size = 10) =>
    axios.get(`${LOAN_API}/loans`, { params: { page, size } }).then(handleResponse),

  search: (query, page = 0, size = 10) =>
    axios.get(`${LOAN_API}/loans/search`, { params: { query, page, size } }).then(handleResponse),

  getById: (id) =>
    axios.get(`${LOAN_API}/loans/${id}`).then(handleResponse),

  getByNumber: (loanNumber) =>
    axios.get(`${LOAN_API}/loans/number/${loanNumber}`).then(handleResponse),

  getByAccount: (accountNumber) =>
    axios.get(`${LOAN_API}/loans/account/${accountNumber}`).then(handleResponse),

  getByType: (loanType, page = 0, size = 10) =>
    axios.get(`${LOAN_API}/loans/type/${loanType}`, { params: { page, size } }).then(handleResponse),

  getEmiSchedule: (loanNumber, page = 0, size = 20) =>
    axios.get(`${LOAN_API}/loans/${loanNumber}/emi-schedule`, { params: { page, size } }).then(handleResponse),

  getDashboardStats: () =>
    axios.get(`${LOAN_API}/loans/stats/dashboard`).then(handleResponse),
};

// Formatting utils
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
