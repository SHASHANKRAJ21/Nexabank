import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Tooltip, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

const TITLES = {
  '/':          'Dashboard',
  '/account':   'My Account',
  '/statement': 'Account Statement',
  '/cards':     'My Cards',
  '/loans':     'My Loans',
  '/profile':   'Profile & Settings',
};

const Header = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES[location.pathname] || 'NexaBank';
  const photo = localStorage.getItem('up_photo');
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="top-header">
      <div className="header-left">
        <span className="page-title">{title}</span>
      </div>
      <div className="header-right">
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: '#94a3b8' }}>
            <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Profile Settings">
          <IconButton size="small" sx={{ color: location.pathname === '/profile' ? '#10b981' : '#94a3b8' }} onClick={() => navigate('/profile')}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={`${user?.username} — Profile`}>
          <Avatar src={photo} onClick={() => navigate('/profile')} sx={{
            width: 32, height: 32, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg,#10b981,#06b6d4)',
            border: location.pathname === '/profile' ? '2px solid #10b981' : '2px solid transparent',
            transition: 'border-color .2s', '&:hover': { borderColor: '#10b981' },
          }}>{!photo && initials}</Avatar>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;
