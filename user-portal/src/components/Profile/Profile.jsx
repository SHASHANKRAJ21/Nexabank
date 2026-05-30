import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Badge, IconButton, Tooltip, CircularProgress } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { authAPI } from '../../services/api';

const Alert = ({ type, msg, onClose }) => !msg ? null : (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderRadius: 9, marginBottom: 18,
    background: type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
    color: type === 'error' ? '#ef4444' : '#10b981', fontSize: 13 }}>
    {type === 'error' ? <ErrorOutlineIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>×</button>
  </div>
);

const Profile = ({ user }) => {
  const [profile, setProfile] = useState({ username: '', email: '', role: '', phone: '' });
  const [photo, setPhoto]     = useState(() => localStorage.getItem('up_photo') || null);
  const [alert, setAlert]     = useState(null);
  const [pLoading, setPLoading] = useState(false);
  const fileRef = useRef();

  // Change password state
  const [form, setForm]   = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow]   = useState({ current: false, newPwd: false, confirm: false });
  const [cpLoading, setCpLoading] = useState(false);

  useEffect(() => {
    authAPI.getMe()
      .then(r => setProfile(r.data))
      .catch(() => setProfile({ username: user?.username || '', email: '', role: user?.role || '', phone: '' }));
  }, [user]);

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setAlert({ type: 'error', msg: 'Select a valid image file.' }); return; }
    if (file.size > 2 * 1024 * 1024) { setAlert({ type: 'error', msg: 'Image must be under 2 MB.' }); return; }
    const reader = new FileReader();
    reader.onload = ev => { setPhoto(ev.target.result); localStorage.setItem('up_photo', ev.target.result); window.dispatchEvent(new Event('upPhotoChanged')); setAlert({ type: 'success', msg: 'Photo updated.' }); };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhoto(null); localStorage.removeItem('up_photo'); window.dispatchEvent(new Event('upPhotoChanged')); setAlert({ type: 'success', msg: 'Photo removed.' }); };

  const strength = pwd => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pwd.length >= 8) s++; if (/[A-Z]/.test(pwd)) s++; if (/[0-9]/.test(pwd)) s++; if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return [{ label:'Too short',color:'#ef4444' },{ label:'Weak',color:'#f97316' },{ label:'Fair',color:'#f59e0b' },{ label:'Good',color:'#06b6d4' },{ label:'Strong',color:'#10b981' }][s];
  };

  const str = strength(form.newPwd);
  const initials = profile.username?.slice(0, 2).toUpperCase() || 'U';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPwd !== form.confirm) { setAlert({ type: 'error', msg: 'New passwords do not match.' }); return; }
    if (form.newPwd.length < 6) { setAlert({ type: 'error', msg: 'Password must be at least 6 characters.' }); return; }
    setCpLoading(true);
    try {
      await authAPI.changePassword(form.current, form.newPwd);
      setAlert({ type: 'success', msg: 'Password changed. Please log in again.' });
      setForm({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.error || 'Failed to change password.' });
    } finally { setCpLoading(false); }
  };

  const inpStyle = (disabled) => ({
    width: '100%', padding: '10px 13px', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color .2s',
    background: disabled ? '#080c1a' : '#0d1225', border: '1px solid rgba(16,185,129,0.15)',
    color: disabled ? '#475569' : '#f8fafc', cursor: disabled ? 'default' : 'text',
  });

  const PwdField = ({ field, label, placeholder }) => {
    const key = field === 'current' ? 'current' : field;
    const val = form[key === 'current' ? 'current' : key === 'newPwd' ? 'newPwd' : 'confirm'];
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 5 }}>{label}</label>
        <div style={{ position: 'relative' }}>
          <input type={show[key] ? 'text' : 'password'} value={val}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder} style={{ ...inpStyle(false), paddingRight: 42 }}
            onFocus={ev => ev.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={ev => ev.target.style.borderColor = 'rgba(16,185,129,0.15)'} />
          <IconButton size="small" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569', '&:hover': { color: '#94a3b8' } }}>
            {show[key] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <Alert type={alert?.type} msg={alert?.msg} onClose={() => setAlert(null)} />

      {/* Profile photo + info */}
      <div style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Upload photo">
                  <IconButton size="small" onClick={() => fileRef.current.click()}
                    sx={{ width: 28, height: 28, background: 'linear-gradient(135deg,#10b981,#06b6d4)', border: '2px solid #0d1225', '&:hover': { background: '#059669' } }}>
                    <CameraAltIcon sx={{ fontSize: 13, color: '#fff' }} />
                  </IconButton>
                </Tooltip>
              }>
              <Avatar src={photo} sx={{ width: 76, height: 76, fontSize: 26, fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#06b6d4)', border: '3px solid rgba(16,185,129,0.25)' }}>
                {!photo && initials}
              </Avatar>
            </Badge>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{profile.username || user?.username}</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>{profile.email || '—'}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fileRef.current.click()} style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Change Photo</button>
              {photo && <button onClick={removePhoto} style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.12)', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Username', profile.username || user?.username],
            ['Email',    profile.email || '—'],
            ['Role',     (profile.role || user?.role || '').replace(/_/g,' ')],
            ['Phone',    profile.phone || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#080c1a', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 9, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13, color: '#f8fafc', fontFamily: label === 'Phone' ? 'monospace' : 'inherit' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockIcon sx={{ fontSize: 17, color: '#10b981' }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Change Password</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Use a strong password you don't use elsewhere</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword}>
          <PwdField field="current" label="Current Password" placeholder="Enter current password" />
          <PwdField field="newPwd"  label="New Password"     placeholder="Min. 6 characters" />
          {form.newPwd && (
            <div style={{ marginTop: -10, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= str.score ? str.color : 'rgba(99,179,237,0.1)', transition: 'background .3s' }} />)}
              </div>
              <span style={{ fontSize: 11, color: str.color, fontWeight: 600 }}>{str.label || ' '}</span>
            </div>
          )}
          <PwdField field="confirm" label="Confirm New Password" placeholder="Repeat new password" />
          {form.confirm && (
            <p style={{ fontSize: 12, marginTop: -10, marginBottom: 14, color: form.newPwd === form.confirm ? '#10b981' : '#ef4444' }}>
              {form.newPwd === form.confirm ? '✓ Passwords match' : '✗ Do not match'}
            </p>
          )}
          <button type="submit" disabled={!form.current || !form.newPwd || !form.confirm || form.newPwd !== form.confirm || form.newPwd.length < 6 || cpLoading}
            style={{ padding: '9px 22px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity .2s',
              background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: '#fff',
              opacity: (!form.current || !form.newPwd || !form.confirm || form.newPwd !== form.confirm || form.newPwd.length < 6 || cpLoading) ? 0.5 : 1,
            }}>
            {cpLoading && <CircularProgress size={12} style={{ color: '#fff' }} />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
