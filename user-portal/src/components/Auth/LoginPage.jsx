import React, { useState, useRef, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { authAPI } from '../../services/api';

const G = '#10b981';

const Steps = ({ current }) => {
  const steps = [
    { icon: <LockIcon sx={{ fontSize: 13 }} />, label: 'Password' },
    { icon: <PhoneIphoneIcon sx={{ fontSize: 13 }} />, label: 'Mobile' },
    { icon: <ShieldIcon sx={{ fontSize: 13 }} />, label: 'Verify OTP' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < current ? G : i === current ? `linear-gradient(135deg,${G},#06b6d4)` : 'rgba(16,185,129,0.08)',
              border: i === current ? `2px solid rgba(16,185,129,0.5)` : i < current ? `2px solid ${G}` : '2px solid rgba(16,185,129,0.15)',
              color: i <= current ? '#fff' : '#475569', fontSize: 11, fontWeight: 700, transition: 'all .3s',
            }}>
              {i < current ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : s.icon}
            </div>
            <span style={{ fontSize: 10, color: i === current ? '#94a3b8' : '#475569' }}>{s.label}</span>
          </div>
          {i < 2 && <div style={{ width: 44, height: 2, margin: '0 4px 14px', background: i < current ? G : 'rgba(16,185,129,0.1)', transition: 'background .3s' }} />}
        </React.Fragment>
      ))}
    </div>
  );
};

const Err = ({ msg }) => msg ? (
  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '9px 13px', color: '#ef4444', fontSize: 12, marginBottom: 14 }}>
    ⚠ {msg}
  </div>
) : null;

const inp = {
  width: '100%', padding: '10px 13px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(16,185,129,0.18)', color: '#f8fafc', fontSize: 14,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s',
};

// ── Step 1 ────────────────────────────────────────────────────────────────────
const StepCredentials = ({ onNext }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      if (res.data?.status === 'OTP_REQUIRED') onNext(res.data.username);
      else setError('Unexpected response from server.');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 5 }}>Username</label>
        <input autoFocus style={inp} value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username"
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(16,185,129,0.18)'} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 5 }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input style={{ ...inp, paddingRight: 42 }} type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(16,185,129,0.18)'} />
          <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
            {show ? <VisibilityOffIcon sx={{ fontSize: 17 }} /> : <VisibilityIcon sx={{ fontSize: 17 }} />}
          </button>
        </div>
      </div>
      <Err msg={error} />
      <button type="submit" disabled={!username || !password || loading} style={btnStyle(!username || !password || loading)}>
        {loading ? <><CircularProgress size={13} style={{ color: '#fff' }} /> Verifying...</> : 'Continue →'}
      </button>
      <div style={{ marginTop: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 9, padding: 12 }}>
        <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Demo Accounts</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 8px', fontSize: 12 }}>
          {[['accounts_user','acc123','#3b82f6','Accounts'],['cards_user','card123','#06b6d4','Cards'],['loans_user','loan123','#10b981','Loans']].map(([u,p,c,l]) => (
            <button key={u} type="button" onClick={() => { setUsername(u); setPassword(p); }}
              style={{ textAlign: 'left', background: `rgba(${hexRgb(c)},0.06)`, border: `1px solid rgba(${hexRgb(c)},0.18)`, borderRadius: 7, padding: '5px 8px', cursor: 'pointer' }}>
              <span style={{ display: 'block', color: c, fontWeight: 700, fontSize: 10 }}>{l}</span>
              <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{u} / {p}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

// ── Step 2 ────────────────────────────────────────────────────────────────────
const StepPhone = ({ username, onNext }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authAPI.sendOtp(username, digits);
      onNext(digits, res.data.devOtp, res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <PhoneIphoneIcon sx={{ fontSize: 24, color: G }} />
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Signing in as <strong style={{ color: G }}>{username}</strong></p>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 5 }}>Mobile Number</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...inp, width: 'auto', padding: '10px 12px', whiteSpace: 'nowrap', color: '#94a3b8' }}>🇮🇳 +91</div>
          <input autoFocus type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
            placeholder="98765 43210" maxLength={10}
            style={{ ...inp, flex: 1, fontFamily: 'monospace', letterSpacing: 2 }}
            onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(16,185,129,0.18)'} />
        </div>
      </div>
      <Err msg={error} />
      <button type="submit" disabled={phone.length < 10 || loading} style={btnStyle(phone.length < 10 || loading)}>
        {loading ? <><CircularProgress size={13} style={{ color: '#fff' }} /> Sending...</> : 'Send OTP →'}
      </button>
    </form>
  );
};

// ── Step 3 ────────────────────────────────────────────────────────────────────
const StepOtp = ({ username, phone, devOtp: initOtp, onSuccess, onResend }) => {
  const [digits, setDigits] = useState(['','','','','','']);
  const [devOtp, setDevOtp] = useState(initOtp);
  const [error, setError] = useState('');
  const [errCode, setErrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const inputs = useRef([]);
  const timerRef = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => { setTimeout(() => inputs.current[0]?.focus(), 100); }, []);
  useEffect(() => { const t = setInterval(() => setCountdown(c => c > 0 ? c-1 : 0), 1000); return () => clearInterval(t); }, []);

  const fillOtp = () => { if (devOtp?.length === 6) setDigits(devOtp.split('')); };

  const otp = digits.join('');

  const submit = async () => {
    if (otp.length !== 6 || loading || locked) return;
    setError(''); setErrCode(''); setLoading(true);
    try {
      const res = await authAPI.verifyOtp(username, otp);
      const { token, username: user, role } = res.data;
      if (!token) throw new Error('No token');
      localStorage.setItem('up_token', token);
      localStorage.setItem('up_user', JSON.stringify({ username: user, role }));
      onSuccess({ username: user, role });
    } catch (err) {
      const code = err.response?.data?.code || '';
      setErrCode(code); setError(err.response?.data?.error || 'Verification failed.');
      if (code === 'MAX_ATTEMPTS') setLocked(true);
      else setTimeout(() => { setDigits(['','','','','','']); inputs.current[0]?.focus(); }, 1200);
    } finally { setLoading(false); }
  };
  submitRef.current = submit;

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (otp.length === 6 && !locked) timerRef.current = setTimeout(() => submitRef.current(), 300);
    return () => clearTimeout(timerRef.current);
  }, [otp, locked]);

  const handleKey = (i, e) => {
    const val = e.target.value.replace(/\D/g,'').slice(-1);
    const next = [...digits]; next[i] = val; setDigits(next);
    if (val && i < 5) inputs.current[i+1]?.focus();
    if (!val && e.nativeEvent.inputType === 'deleteContentBackward' && i > 0) inputs.current[i-1]?.focus();
  };

  const resend = async () => {
    setResending(true);
    try {
      const res = await onResend();
      setDevOtp(res?.devOtp || '');
      setCountdown(120); setDigits(['','','','','','']); setError(''); setErrCode(''); setLocked(false);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } catch { setError('Failed to resend OTP.'); } finally { setResending(false); }
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const border = d => (errCode === 'MAX_ATTEMPTS' || (error && d)) ? '2px solid rgba(239,68,68,0.5)' : d ? `2px solid rgba(16,185,129,0.6)` : `2px solid rgba(16,185,129,0.2)`;

  return (
    <form onSubmit={e => { e.preventDefault(); submit(); }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: `2px solid rgba(16,185,129,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <ShieldIcon sx={{ fontSize: 24, color: G }} />
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>OTP sent to +91 XXXXXX{phone?.slice(-4)}</p>
      </div>
      {devOtp && (
        <button type="button" onClick={fillOtp} style={{ width: '100%', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 9, padding: '9px 14px', marginBottom: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 10, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>⚡ Dev — tap to fill</span>
            <span style={{ fontSize: 10, color: '#92794a' }}>Click to auto-fill OTP</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 6, color: '#f59e0b', fontFamily: 'monospace' }}>{devOtp}</span>
        </button>
      )}
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 14 }}>
        {digits.map((d, i) => (
          <input key={i} ref={el => inputs.current[i] = el} value={d} onChange={e => handleKey(i, e)}
            maxLength={1} inputMode="numeric" disabled={loading || locked}
            style={{ width: 42, height: 50, textAlign: 'center', fontSize: 22, fontWeight: 700, borderRadius: 8,
              border: border(d), background: (error && d) ? 'rgba(239,68,68,0.08)' : d ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
              color: '#f8fafc', outline: 'none', fontFamily: 'monospace', transition: 'all .15s',
              opacity: (loading || locked) ? 0.5 : 1 }} />
        ))}
      </div>
      <Err msg={error} />
      <button type="submit" disabled={otp.length !== 6 || loading || locked} style={btnStyle(otp.length !== 6 || loading || locked)}>
        {loading ? <><CircularProgress size={13} style={{ color: '#fff' }} /> Verifying...</> : 'Verify & Sign In'}
      </button>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#475569' }}>
        {locked ? <button type="button" onClick={resend} disabled={resending} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{resending ? 'Sending...' : '↺ New OTP'}</button>
          : countdown > 0 ? <>Resend in <span style={{ color: '#94a3b8', fontWeight: 600 }}>{fmt(countdown)}</span></>
          : <button type="button" onClick={resend} disabled={resending} style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{resending ? 'Sending...' : '↺ Resend OTP'}</button>}
      </div>
    </form>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const handleResend = async () => {
    const res = await authAPI.sendOtp(username, phone);
    setDevOtp(res.data.devOtp || '');
    return res.data;
  };

  const titles = ['Welcome Back', 'Verify Mobile', 'Enter OTP'];
  const subs   = ['Sign in to your account portal', "We'll send you a one-time password", 'Complete two-factor authentication'];

  return (
    <div style={{ minHeight: '100vh', background: '#080c1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(16,185,129,0.03) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 18, padding: '32px 36px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#10b981,#06b6d4)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
            <AccountBalanceIcon sx={{ fontSize: 26, color: '#fff' }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{titles[step]}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>{subs[step]}</div>
        </div>
        <Steps current={step} />
        {step === 0 && <StepCredentials onNext={u => { setUsername(u); setStep(1); }} />}
        {step === 1 && <StepPhone username={username} onNext={(ph, otp) => { setPhone(ph); setDevOtp(otp); setStep(2); }} />}
        {step === 2 && <StepOtp username={username} phone={phone} devOtp={devOtp} onSuccess={onLogin} onResend={handleResend} />}
      </div>
    </div>
  );
};

const btnStyle = (disabled) => ({
  width: '100%', padding: '10px', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg,#10b981,#06b6d4)',
  color: disabled ? '#475569' : '#fff', fontSize: 14, fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
});

const hexRgb = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16); return `${r},${g},${b}`; };

export default LoginPage;
