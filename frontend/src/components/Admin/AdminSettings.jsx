import React, { useState, useRef, useEffect } from 'react';
import {
  Avatar, Badge, IconButton, Tooltip, CircularProgress,
  Switch, Select, MenuItem, FormControl,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import TuneIcon from '@mui/icons-material/Tune';
import PeopleIcon from '@mui/icons-material/People';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import { adminAPI } from '../../services/api';

const ALL_TABS = [
  { id: 'profile',     label: 'Profile',          icon: <PersonIcon fontSize="small" />,           roles: ['ADMIN','USER','ACCOUNTS_USER','CARDS_USER','LOANS_USER'] },
  { id: 'security',    label: 'Security',         icon: <LockIcon fontSize="small" />,             roles: ['ADMIN','USER','ACCOUNTS_USER','CARDS_USER','LOANS_USER'] },
  { id: 'preferences', label: 'Preferences',      icon: <TuneIcon fontSize="small" />,             roles: ['ADMIN','USER','ACCOUNTS_USER','CARDS_USER','LOANS_USER'] },
  { id: 'users',       label: 'User Management',  icon: <PeopleIcon fontSize="small" />,           roles: ['ADMIN'] },
];

// Role display config used in the page header
const ROLE_META = {
  ADMIN:         { title: 'Admin Settings',    subtitle: 'Manage profile, security, preferences and users', color: '#8b5cf6' },
  USER:          { title: 'My Settings',       subtitle: 'Manage your profile, password and preferences',  color: '#3b82f6' },
  ACCOUNTS_USER: { title: 'Account Settings',  subtitle: 'Manage your profile, password and preferences',  color: '#3b82f6' },
  CARDS_USER:    { title: 'Cards Settings',    subtitle: 'Manage your profile, password and preferences',  color: '#06b6d4' },
  LOANS_USER:    { title: 'Loans Settings',    subtitle: 'Manage your profile, password and preferences',  color: '#10b981' },
};

// ── tiny alert component ──────────────────────────────────────────────────────
const Alert = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 10, marginBottom: 20,
      background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
      border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
      color: isError ? '#ef4444' : '#10b981',
      fontSize: 13,
    }}>
      {isError ? <ErrorIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
};

// ── labelled input ────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{hint}</p>}
  </div>
);

const inputStyle = {
  width: '100%', background: '#0d1225', border: '1px solid rgba(99,179,237,0.15)',
  borderRadius: 8, padding: '10px 14px', color: '#f8fafc', fontSize: 14,
  outline: 'none', transition: 'border-color .2s',
  fontFamily: 'inherit',
};

const Input = ({ value, onChange, type = 'text', placeholder, disabled, readOnly, style }) => (
  <input
    value={value} onChange={onChange} type={type} placeholder={placeholder}
    disabled={disabled} readOnly={readOnly}
    style={{
      ...inputStyle,
      background: (disabled || readOnly) ? '#080c1a' : '#0d1225',
      color: (disabled || readOnly) ? '#475569' : '#f8fafc',
      cursor: readOnly ? 'default' : 'text',
      ...style,
    }}
    onFocus={e => !readOnly && !disabled && (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
    onBlur={e => e.target.style.borderColor = 'rgba(99,179,237,0.15)'}
  />
);

const Btn = ({ onClick, disabled, loading, variant = 'primary', children, style }) => {
  const base = {
    padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer', border: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all .2s', opacity: (disabled || loading) ? 0.6 : 1,
    fontFamily: 'inherit', ...style,
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff' },
    danger:  { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
    ghost:   { background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid rgba(99,179,237,0.12)' },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant] }}>
      {loading && <CircularProgress size={13} style={{ color: 'inherit' }} />}
      {children}
    </button>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ══════════════════════════════════════════════════════════════════════════════
const ProfileTab = ({ user }) => {
  const [profile, setProfile] = useState({ username: '', email: '', role: '' });
  const [photoSrc, setPhotoSrc] = useState(() => localStorage.getItem('adminPhoto') || null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setLoading(true);
    adminAPI.getProfile()
      .then(r => setProfile(r.data))
      .catch(() => setProfile({ username: user?.username || '', email: '', role: user?.role || '' }))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'Image must be under 2 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setPhotoSrc(src);
      localStorage.setItem('adminPhoto', src);
      window.dispatchEvent(new Event('adminPhotoChanged'));
      setAlert({ type: 'success', message: 'Profile photo updated.' });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoSrc(null);
    localStorage.removeItem('adminPhoto');
    window.dispatchEvent(new Event('adminPhotoChanged'));
    setAlert({ type: 'success', message: 'Profile photo removed.' });
  };

  const initials = profile.username?.slice(0, 2).toUpperCase() || 'AD';

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Profile</h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Manage your admin profile and photo</p>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Avatar upload card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24, padding: 24,
        background: '#111827', border: '1px solid rgba(99,179,237,0.12)',
        borderRadius: 14, marginBottom: 28,
      }}>
        <div style={{ position: 'relative' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title="Upload photo">
                <IconButton
                  size="small"
                  onClick={() => fileRef.current.click()}
                  sx={{
                    width: 30, height: 30,
                    background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                    border: '2px solid #0d1225',
                    '&:hover': { background: 'linear-gradient(135deg,#2563eb,#0891b2)' },
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: 14, color: '#fff' }} />
                </IconButton>
              </Tooltip>
            }
          >
            <Avatar
              src={photoSrc}
              sx={{
                width: 80, height: 80, fontSize: 28, fontWeight: 700,
                background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                border: '3px solid rgba(59,130,246,0.3)',
              }}
            >
              {!photoSrc && initials}
            </Avatar>
          </Badge>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{profile.username || user?.username}</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{profile.email || 'No email set'}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => fileRef.current.click()} variant="primary" style={{ padding: '7px 16px', fontSize: 12 }}>
              Change Photo
            </Btn>
            {photoSrc && (
              <Btn onClick={removePhoto} variant="ghost" style={{ padding: '7px 16px', fontSize: 12 }}>
                Remove
              </Btn>
            )}
          </div>
        </div>
      </div>

      {/* Read-only info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Field label="Username">
          <Input value={profile.username || user?.username || ''} readOnly />
        </Field>
        <Field label="Email">
          <Input value={profile.email || ''} readOnly placeholder="Not set" />
        </Field>
        <Field label="Role">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input value={profile.role || user?.role || ''} readOnly />
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
              border: '1px solid rgba(59,130,246,0.25)', whiteSpace: 'nowrap',
            }}>
              {profile.role === 'ADMIN' ? '🛡 Admin' : '👤 User'}
            </span>
          </div>
        </Field>
        <Field label="Account Status">
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: '#080c1a',
            border: '1px solid rgba(99,179,237,0.15)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
          </div>
        </Field>
      </div>

      <p style={{ fontSize: 12, color: '#475569' }}>
        Profile photo is stored locally in your browser. Username and role can only be changed by a super-admin.
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECURITY TAB
// ══════════════════════════════════════════════════════════════════════════════
const SecurityTab = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const strength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: 'Too short', color: '#ef4444' },
      { label: 'Weak', color: '#f97316' },
      { label: 'Fair', color: '#f59e0b' },
      { label: 'Good', color: '#06b6d4' },
      { label: 'Strong', color: '#10b981' },
    ];
    return { score, ...map[score] };
  };

  const s = strength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    try {
      await adminAPI.changePassword(form.currentPassword, form.newPassword);
      setAlert({ type: 'success', message: 'Password changed successfully. Please log in again.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Security</h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Change your password and manage account security</p>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Change password */}
      <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>Change Password</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Use a strong password you don't use elsewhere</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>

          {/* Current password */}
          <Field label="Current Password">
            <div style={{ position: 'relative' }}>
              <Input type={show.current ? 'text' : 'password'} value={form.currentPassword}
                onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Enter current password" style={{ paddingRight: 44 }} />
              <IconButton size="small" onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569', '&:hover': { color: '#94a3b8' } }}>
                {show.current ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </div>
          </Field>

          {/* New password */}
          <Field label="New Password">
            <div style={{ position: 'relative' }}>
              <Input type={show.newPwd ? 'text' : 'password'} value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Min. 6 characters" style={{ paddingRight: 44 }} />
              <IconButton size="small" onClick={() => setShow(s => ({ ...s, newPwd: !s.newPwd }))}
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569', '&:hover': { color: '#94a3b8' } }}>
                {show.newPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </div>
          </Field>

          {/* Strength meter — always in DOM, just invisible when empty */}
          <div style={{ marginTop: -12, marginBottom: 20, opacity: form.newPassword ? 1 : 0, transition: 'opacity .2s' }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= s.score ? s.color : 'rgba(99,179,237,0.1)',
                  transition: 'background .3s',
                }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label || ' '}</p>
          </div>

          {/* Confirm password */}
          <Field label="Confirm New Password">
            <div style={{ position: 'relative' }}>
              <Input type={show.confirm ? 'text' : 'password'} value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Repeat new password" style={{ paddingRight: 44 }} />
              <IconButton size="small" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569', '&:hover': { color: '#94a3b8' } }}>
                {show.confirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </div>
          </Field>

          {/* Match indicator — always in DOM */}
          <p style={{ fontSize: 12, marginTop: -12, marginBottom: 16, opacity: form.confirmPassword ? 1 : 0, transition: 'opacity .2s',
            color: form.newPassword === form.confirmPassword ? '#10b981' : '#ef4444' }}>
            {form.newPassword === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>

          <Btn type="submit" loading={loading}
            disabled={
              !form.currentPassword || !form.newPassword || !form.confirmPassword ||
              form.newPassword !== form.confirmPassword || form.newPassword.length < 6
            }>
            Update Password
          </Btn>
        </form>
      </div>

      {/* Security info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { icon: <ShieldIcon sx={{ fontSize: 18, color: '#10b981' }} />, color: '#10b981', title: 'JWT Auth', desc: 'Token-based authentication active' },
          { icon: <SecurityIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />, color: '#8b5cf6', title: 'BCrypt Hashing', desc: 'Password stored with BCrypt' },
        ].map((card) => (
          <div key={card.title} style={{ padding: 16, background: '#111827', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${card.color === '#10b981' ? '16,185,129' : '139,92,246'},.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>{card.title}</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PREFERENCES TAB
// ══════════════════════════════════════════════════════════════════════════════
const PreferencesTab = () => {
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminPrefs')) || {}; } catch { return {}; }
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const save = () => {
    localStorage.setItem('adminPrefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Row = ({ icon, title, desc, control }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(99,179,237,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#f8fafc' }}>{title}</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>{desc}</p>
        </div>
      </div>
      {control}
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Preferences</h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Customize your admin experience</p>

      {saved && <Alert type="success" message="Preferences saved." onClose={() => setSaved(false)} />}

      <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 14, padding: '4px 24px 4px', marginBottom: 24 }}>
        <Row
          icon={<NotificationsIcon fontSize="small" />}
          title="Desktop Notifications"
          desc="Show browser notifications for important events"
          control={<Switch checked={!!prefs.desktopNotif} onChange={() => toggle('desktopNotif')} size="small" sx={{ '& .MuiSwitch-thumb': { background: '#3b82f6' }, '& .Mui-checked+.MuiSwitch-track': { background: 'rgba(59,130,246,0.4)' } }} />}
        />
        <Row
          icon={<NotificationsIcon fontSize="small" />}
          title="Email Alerts"
          desc="Receive email for suspicious activity"
          control={<Switch checked={!!prefs.emailAlerts} onChange={() => toggle('emailAlerts')} size="small" sx={{ '& .MuiSwitch-thumb': { background: '#3b82f6' }, '& .Mui-checked+.MuiSwitch-track': { background: 'rgba(59,130,246,0.4)' } }} />}
        />
        <Row
          icon={<DarkModeIcon fontSize="small" />}
          title="Compact Mode"
          desc="Reduce spacing in tables and lists"
          control={<Switch checked={!!prefs.compactMode} onChange={() => toggle('compactMode')} size="small" sx={{ '& .MuiSwitch-thumb': { background: '#3b82f6' }, '& .Mui-checked+.MuiSwitch-track': { background: 'rgba(59,130,246,0.4)' } }} />}
        />
        <Row
          icon={<LanguageIcon fontSize="small" />}
          title="Language"
          desc="Interface display language"
          control={
            <FormControl size="small">
              <Select
                value={prefs.language || 'en'}
                onChange={e => set('language', e.target.value)}
                sx={{ fontSize: 13, color: '#f8fafc', background: '#0d1225', border: '1px solid rgba(99,179,237,0.15)', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="mr">Marathi</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <Row
          icon={<AdminPanelSettingsIcon fontSize="small" />}
          title="Auto-logout"
          desc="Log out after period of inactivity"
          control={
            <FormControl size="small">
              <Select
                value={prefs.autoLogout || '30'}
                onChange={e => set('autoLogout', e.target.value)}
                sx={{ fontSize: 13, color: '#f8fafc', background: '#0d1225', border: '1px solid rgba(99,179,237,0.15)', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
              >
                <MenuItem value="15">15 minutes</MenuItem>
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="60">1 hour</MenuItem>
                <MenuItem value="never">Never</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </div>

      <Btn onClick={save} variant="primary">
        {saved ? '✓ Saved' : 'Save Preferences'}
      </Btn>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT TAB
// ══════════════════════════════════════════════════════════════════════════════
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.listUsers()
      .then(r => setUsers(r.data))
      .catch(() => setAlert({ type: 'error', message: 'Failed to load users. Ensure you are logged in as ADMIN.' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const action  = u.role === 'ADMIN' ? 'demote' : 'promote';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${u.username}" from ${u.role} to ${newRole}?`)) return;
    setUpdating(u.id);
    try {
      await adminAPI.updateUserRole(u.id, newRole);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
      setAlert({ type: 'success', message: `${u.username} ${action}d to ${newRole}.` });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to update role.' });
    } finally {
      setUpdating(null);
    }
  };

  const roleColor = (role) => role === 'ADMIN'
    ? { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' }
    : { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>User Management</h2>
        <Btn onClick={load} variant="ghost" style={{ padding: '6px 14px', fontSize: 12 }}>↻ Refresh</Btn>
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Manage system users and their roles</p>

      <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </div>
      ) : (
        <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 14, overflow: 'hidden' }}>
          {/* Table head */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1.5fr 120px 130px', gap: 0, padding: '10px 20px', background: 'rgba(99,179,237,0.05)', borderBottom: '1px solid rgba(99,179,237,0.1)' }}>
            {['#', 'Username', 'Email', 'Role', 'Action'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {users.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>No users found.</div>
          ) : (
            users.map((u, idx) => {
              const rc = roleColor(u.role);
              return (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1.5fr 120px 130px', gap: 0,
                  padding: '14px 20px', borderBottom: '1px solid rgba(99,179,237,0.06)',
                  alignItems: 'center',
                  transition: 'background .2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{idx + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
                      {u.username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#f8fafc' }}>{u.username}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{u.email}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, display: 'inline-block' }}>
                    {u.role === 'ADMIN' ? '🛡 Admin' : '👤 User'}
                  </span>
                  <Btn
                    onClick={() => toggleRole(u)}
                    loading={updating === u.id}
                    variant={u.role === 'ADMIN' ? 'danger' : 'ghost'}
                    style={{ padding: '5px 12px', fontSize: 11 }}
                  >
                    {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                  </Btn>
                </div>
              );
            })
          )}
        </div>
      )}

      <p style={{ fontSize: 12, color: '#475569', marginTop: 16 }}>
        Total users: <strong style={{ color: '#94a3b8' }}>{users.length}</strong> &nbsp;·&nbsp;
        Admins: <strong style={{ color: '#8b5cf6' }}>{users.filter(u => u.role === 'ADMIN').length}</strong>
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const AdminSettings = ({ user }) => {
  const role = user?.role || 'USER';
  const meta = ROLE_META[role] || ROLE_META.USER;
  const tabs = ALL_TABS.filter(t => t.roles.includes(role));
  const [tab, setTab] = useState('profile');

  const tabContent = {
    profile:     <ProfileTab user={user} />,
    security:    <SecurityTab />,
    preferences: <PreferencesTab />,
    users:       <UsersTab />,
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${meta.color}, #06b6d4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ManageAccountsIcon sx={{ fontSize: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>{meta.title}</h1>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>{meta.subtitle}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left tab nav */}
        <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 14, padding: 8, position: 'sticky', top: 0 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                marginBottom: 2, textAlign: 'left', fontSize: 13, fontWeight: 500,
                transition: 'all .2s', fontFamily: 'inherit',
                background: tab === t.id ? `rgba(${hexToRgbStr(meta.color)},0.15)` : 'transparent',
                color: tab === t.id ? meta.color : '#94a3b8',
                outline: tab === t.id ? `1px solid rgba(${hexToRgbStr(meta.color)},0.25)` : 'none',
              }}
            >
              <span style={{ opacity: tab === t.id ? 1 : 0.7, display: 'flex' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
          {/* Role badge inside tab nav */}
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: `rgba(${hexToRgbStr(meta.color)},0.07)`, border: `1px solid rgba(${hexToRgbStr(meta.color)},0.15)` }}>
            <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>Signed in as</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{user?.username}</p>
            <p style={{ fontSize: 10, color: '#475569' }}>{meta.title.replace(' Settings','')}</p>
          </div>
        </div>

        {/* Right content panel */}
        <div style={{
          background: '#111827', border: '1px solid rgba(99,179,237,0.12)',
          borderRadius: 14, padding: 28, minHeight: 400,
        }}>
          {tabContent[tab]}
        </div>
      </div>
    </div>
  );
};

const hexToRgbStr = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
};

export default AdminSettings;
