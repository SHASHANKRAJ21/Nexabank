import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar } from '@mui/material';

const ALL_ITEMS = [
  { section: 'Overview',     allowedRoles: ['ADMIN', 'USER'] },
  { path: '/',               label: 'Dashboard',      icon: <DashboardIcon fontSize="small" />,      allowedRoles: ['ADMIN', 'USER'] },

  { section: 'Services',     allowedRoles: ['ADMIN', 'USER', 'ACCOUNTS_USER', 'CARDS_USER', 'LOANS_USER'] },
  { path: '/accounts',       label: 'Accounts',       icon: <AccountBalanceIcon fontSize="small" />, allowedRoles: ['ADMIN', 'USER', 'ACCOUNTS_USER'] },
  { path: '/cards',          label: 'Cards',          icon: <CreditCardIcon fontSize="small" />,     allowedRoles: ['ADMIN', 'USER', 'CARDS_USER'] },
  { path: '/loans',          label: 'Loans',          icon: <AssessmentIcon fontSize="small" />,     allowedRoles: ['ADMIN', 'USER', 'LOANS_USER'] },

  { section: 'Account',      allowedRoles: ['USER', 'ACCOUNTS_USER', 'CARDS_USER', 'LOANS_USER'] },
  { path: '/settings',       label: 'My Settings',    icon: <SettingsIcon fontSize="small" />,       allowedRoles: ['USER', 'ACCOUNTS_USER', 'CARDS_USER', 'LOANS_USER'] },

  { section: 'Admin',        allowedRoles: ['ADMIN'] },
  { path: '/admin/settings', label: 'Admin Settings', icon: <ManageAccountsIcon fontSize="small" />, allowedRoles: ['ADMIN'] },
];

// Role display config
const ROLE_CONFIG = {
  ADMIN:         { label: 'Administrator',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  USER:          { label: 'User',           color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  ACCOUNTS_USER: { label: 'Accounts Staff', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  CARDS_USER:    { label: 'Cards Staff',    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  LOANS_USER:    { label: 'Loans Staff',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const Sidebar = ({ user }) => {
  const location = useLocation();
  const role = user?.role || 'USER';
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
  const photo = localStorage.getItem('adminPhoto');
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AD';

  // Filter items visible to this role
  const visibleItems = ALL_ITEMS.filter(item =>
    !item.allowedRoles || item.allowedRoles.includes(role)
  );

  // Drop section headers that have no nav-item immediately following
  const dedupedItems = visibleItems.filter((item, idx) => {
    if (!item.section) return true;
    const next = visibleItems[idx + 1];
    return next && !next.section;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">N</div>
          <div className="logo-text">
            <div className="name">NexaBank</div>
            <div className="tagline">Enterprise Banking</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {dedupedItems.map((item, idx) => {
          if (item.section) {
            return <div key={idx} className="nav-section-label">{item.section}</div>;
          }
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User card at bottom of sidebar */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(99,179,237,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
          <Avatar src={photo} sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, background: `linear-gradient(135deg,${rc.color},#06b6d4)`, flexShrink: 0 }}>
            {!photo && initials}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: rc.color, background: rc.bg, padding: '1px 7px', borderRadius: 10 }}>{rc.label}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="dot" />
          All Services Online
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
