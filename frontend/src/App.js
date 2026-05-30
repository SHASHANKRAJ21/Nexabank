import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/global.scss';

import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Accounts from './components/Accounts/Accounts';
import Cards from './components/Cards/Cards';
import Loans from './components/Loans/Loans';
import AdminSettings from './components/Admin/AdminSettings';
import LoginPage from './components/Auth/LoginPage';

// ── permissions map ──────────────────────────────────────────────────────
const ROLE_ALLOWED = {
  ADMIN:         ['/', '/accounts', '/cards', '/loans', '/admin/settings', '/settings'],
  USER:          ['/', '/accounts', '/cards', '/loans', '/settings'],
  ACCOUNTS_USER: ['/accounts', '/settings'],
  CARDS_USER:    ['/cards', '/settings'],
  LOANS_USER:    ['/loans', '/settings'],
};

const ROLE_HOME = {
  ADMIN:         '/',
  USER:          '/',
  ACCOUNTS_USER: '/accounts',
  CARDS_USER:    '/cards',
  LOANS_USER:    '/loans',
};

// ── protected route ──────────────────────────────────────────────────────
const Guard = ({ role, path, children }) => {
  const allowed = ROLE_ALLOWED[role] || [];
  if (!allowed.includes(path)) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }
  return children;
};

// ── main layout (rendered after login) ──────────────────────────────────
const AppLayout = ({ user, onLogout }) => {
  const role = user?.role || 'USER';
  const home = ROLE_HOME[role] || '/';

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <div className="main-content">
        <Header user={user} onLogout={onLogout} />
        <main className="content-area">
          <Routes>
            {/* Only ADMIN / USER get the dashboard */}
            <Route path="/" element={
              <Guard role={role} path="/"><Dashboard /></Guard>
            } />
            <Route path="/accounts" element={
              <Guard role={role} path="/accounts"><Accounts /></Guard>
            } />
            <Route path="/cards" element={
              <Guard role={role} path="/cards"><Cards /></Guard>
            } />
            <Route path="/loans" element={
              <Guard role={role} path="/loans"><Loans /></Guard>
            } />
            <Route path="/settings" element={
              <Guard role={role} path="/settings"><AdminSettings user={user} /></Guard>
            } />
            <Route path="/admin/settings" element={
              <Guard role={role} path="/admin/settings"><AdminSettings user={user} /></Guard>
            } />
            {/* Fallback → role's home page */}
            <Route path="*" element={<Navigate to={home} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ── root ─────────────────────────────────────────────────────────────────
const App = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
};

export default App;
