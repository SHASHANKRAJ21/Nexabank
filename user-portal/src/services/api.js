import axios from 'axios';

const ACCOUNT_API = 'http://localhost:8081/api';
const CARD_API    = 'http://localhost:8082/api';
const LOAN_API    = 'http://localhost:8083/api';

axios.defaults.timeout = 30000;

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('up_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('up_token');
      localStorage.removeItem('up_user');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:     (username, password) => axios.post(`${ACCOUNT_API}/auth/login`, { username, password }),
  sendOtp:   (username, phone)    => axios.post(`${ACCOUNT_API}/auth/send-otp`, { username, phone }),
  verifyOtp: (username, otp)      => axios.post(`${ACCOUNT_API}/auth/verify-otp`, { username, otp }),
  getMe:     ()                   => axios.get(`${ACCOUNT_API}/auth/me`),
  changePassword: (currentPassword, newPassword) =>
    axios.put(`${ACCOUNT_API}/auth/change-password`, { currentPassword, newPassword }),
};

// ── Accounts ──────────────────────────────────────────────────────────────────
export const accountAPI = {
  search:          (query, page = 0, size = 10)  => axios.get(`${ACCOUNT_API}/accounts/search`, { params: { query, page, size } }),
  getByNumber:     (accountNumber)                => axios.get(`${ACCOUNT_API}/accounts/number/${accountNumber}`),
  getTransactions: (accountNumber, page = 0, size = 20) =>
    axios.get(`${ACCOUNT_API}/accounts/${accountNumber}/transactions`, { params: { page, size } }),
};

// ── Cards ─────────────────────────────────────────────────────────────────────
export const cardAPI = {
  getByAccount:     (accountNumber)                  => axios.get(`${CARD_API}/cards/account/${accountNumber}`),
  getTransactions:  (cardNumber, page = 0, size = 20) =>
    axios.get(`${CARD_API}/cards/${cardNumber}/transactions`, { params: { page, size } }),
};

// ── Loans ─────────────────────────────────────────────────────────────────────
export const loanAPI = {
  getByAccount:  (accountNumber)                    => axios.get(`${LOAN_API}/loans/account/${accountNumber}`),
  getEmiSchedule:(loanNumber, page = 0, size = 20)  =>
    axios.get(`${LOAN_API}/loans/${loanNumber}/emi-schedule`, { params: { page, size } }),
};

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmt = {
  currency: (n) => n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
    : '—',
  date: (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  dateTime: (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
};
