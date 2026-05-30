import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import './styles/global.scss';

import Sidebar        from './components/Layout/Sidebar';
import Header         from './components/Layout/Header';
import Dashboard      from './components/Dashboard/Dashboard';
import AccountOverview from './components/Account/AccountOverview';
import Statement      from './components/Statement/Statement';
import MyCards        from './components/Cards/MyCards';
import MyLoans        from './components/Loans/MyLoans';
import Profile        from './components/Profile/Profile';
import LoginPage      from './components/Auth/LoginPage';
import { authAPI, accountAPI } from './services/api';

// ── authenticated layout ──────────────────────────────────────────────────
const AppLayout = ({ user, accountNumber, onLogout }) => (
  <div className="app-layout">
    <Sidebar user={user} onLogout={onLogout} />
    <div className="main-content">
      <Header user={user} />
      <main className="content-area">
        <Routes>
          <Route path="/"          element={<Dashboard      accountNumber={accountNumber} />} />
          <Route path="/account"   element={<AccountOverview accountNumber={accountNumber} />} />
          <Route path="/statement" element={<Statement      accountNumber={accountNumber} />} />
          <Route path="/cards"     element={<MyCards        accountNumber={accountNumber} />} />
          <Route path="/loans"     element={<MyLoans        accountNumber={accountNumber} />} />
          <Route path="/profile"   element={<Profile        user={user} />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  </div>
);

// ── splash shown while resolving account number ───────────────────────────
const Splash = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080c1a', gap: 18 }}>
    <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#10b981,#06b6d4)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', fontSize: 26, fontWeight: 800, color: '#fff' }}>N</div>
    <CircularProgress sx={{ color: '#10b981' }} size={28} />
    <p style={{ fontSize: 13, color: '#475569' }}>Loading your account…</p>
  </div>
);

// ── root ──────────────────────────────────────────────────────────────────
const App = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('up_user')); } catch { return null; }
  });
  const [accountNumber, setAccountNumber] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) { setReady(true); return; }
    authAPI.getMe()
      .then(r => {
        const profile = r.data;
        if (profile?.accountNumber) {
          setAccountNumber(profile.accountNumber);
        } else {
          // fallback: find the first account linked to this user by searching username
          return accountAPI.search(profile?.username || user.username, 0, 5)
            .then(res => {
              const list = res.data?.data?.content || res.data?.content || [];
              if (list.length > 0) setAccountNumber(list[0].accountNumber);
            });
        }
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('up_token');
          localStorage.removeItem('up_user');
          setUser(null);
        }
      })
      .finally(() => setReady(true));
  }, [user?.username]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (userData) => {
    setReady(false);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('up_token');
    localStorage.removeItem('up_user');
    localStorage.removeItem('up_photo');
    setUser(null);
    setAccountNumber(null);
    setReady(true);
  };

  if (!ready) return <Splash />;
  if (!user)  return <LoginPage onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <AppLayout user={user} accountNumber={accountNumber} onLogout={handleLogout} />
    </BrowserRouter>
  );
};

export default App;
