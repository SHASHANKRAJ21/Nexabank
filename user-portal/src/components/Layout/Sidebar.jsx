import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const NAV = [
  { section: 'Overview' },
  { path: '/',          label: 'Dashboard',  icon: <DashboardIcon fontSize="small" /> },
  { section: 'Banking' },
  { path: '/account',   label: 'My Account', icon: <AccountBalanceWalletIcon fontSize="small" /> },
  { path: '/statement', label: 'Statement',  icon: <ReceiptLongIcon fontSize="small" /> },
  { path: '/cards',     label: 'My Cards',   icon: <CreditCardIcon fontSize="small" /> },
  { path: '/loans',     label: 'My Loans',   icon: <PaymentsIcon fontSize="small" /> },
  { section: 'Settings' },
  { path: '/profile',   label: 'Profile',    icon: <PersonIcon fontSize="small" /> },
];

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const photo = localStorage.getItem('up_photo');
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-wrap">
          <div className="logo-icon">N</div>
          <div>
            <div className="logo-name">NexaBank</div>
            <div className="logo-tag">My Account Portal</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item, idx) => {
          if (item.section) return <div key={idx} className="nav-section">{item.section}</div>;
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
        <div className="nav-section" style={{ marginTop: 'auto' }} />
        <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', textAlign: 'left' }}>
          <span className="nav-icon"><LogoutIcon fontSize="small" /></span>
          Sign Out
        </button>
      </nav>

      <div className="sidebar-user">
        <div className="user-card">
          <Avatar src={photo} sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#06b6d4)', flexShrink: 0 }}>
            {!photo && initials}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <p className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
            <span className="user-badge">{(user?.role || '').replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="status"><div className="dot" /> All Services Online</div>
      </div>
    </aside>
  );
};

export default Sidebar;
