import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { Badge, Avatar, IconButton, Tooltip } from '@mui/material';

const pageTitles = {
  '/': 'Dashboard',
  '/accounts': 'Account Management',
  '/cards': 'Card Management',
  '/loans': 'Loan Management',
  '/admin/settings': 'Admin Settings',
  '/settings': 'My Settings',
};

const Header = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [photoSrc, setPhotoSrc] = useState(() => localStorage.getItem('adminPhoto') || null);

  // Listen for photo changes triggered from AdminSettings
  useEffect(() => {
    const handlePhotoChange = () => setPhotoSrc(localStorage.getItem('adminPhoto') || null);
    window.addEventListener('adminPhotoChanged', handlePhotoChange);
    return () => window.removeEventListener('adminPhotoChanged', handlePhotoChange);
  }, []);

  const title = pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'NexaBank';

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AD';
  const settingsPath = user?.role === 'ADMIN' ? '/admin/settings' : '/settings';
  const isOnSettings = location.pathname === '/admin/settings' || location.pathname === '/settings';

  return (
    <header className="top-header">
      <div className="header-left">
        <span className="page-title">{title}</span>
      </div>
      <div className="header-right">
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: '#94a3b8' }}>
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton
            size="small"
            onClick={() => navigate(isOnSettings ? '/' : settingsPath)}
            sx={{
              color: isOnSettings ? '#3b82f6' : '#94a3b8',
              background: isOnSettings ? 'rgba(59,130,246,0.1)' : 'transparent',
              '&:hover': { color: '#3b82f6', background: 'rgba(59,130,246,0.08)' },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={`${user?.username} · Settings`}>
          <Avatar
            src={photoSrc}
            onClick={() => navigate(settingsPath)}
            sx={{
              width: 34, height: 34, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              cursor: 'pointer',
              border: isOnSettings ? '2px solid #3b82f6' : '2px solid transparent',
              transition: 'border-color .2s, box-shadow .2s',
              '&:hover': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 3px rgba(59,130,246,0.2)',
              },
            }}
          >
            {!photoSrc && initials}
          </Avatar>
        </Tooltip>

        <Tooltip title={`Sign out (${user?.username})`}>
          <IconButton size="small" sx={{ color: '#94a3b8' }} onClick={onLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;
