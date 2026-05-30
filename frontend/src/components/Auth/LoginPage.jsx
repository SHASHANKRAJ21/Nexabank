import React, { useState, useRef, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { authAPI } from '../../services/api';

// ── step indicator ─────────────────────────────────────────────────────────
const Steps = ({ current }) => {
  const steps = [
    { icon: <LockIcon sx={{ fontSize: 13 }} />, label: 'Password' },
    { icon: <PhoneIphoneIcon sx={{ fontSize: 13 }} />, label: 'Mobile' },
    { icon: <ShieldIcon sx={{ fontSize: 13 }} />, label: 'Verify OTP' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 0 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < current ? '#10b981' : i === current ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'rgba(99,179,237,0.08)',
              border: i === current ? '2px solid rgba(59,130,246,0.5)' : i < current ? '2px solid #10b981' : '2px solid rgba(99,179,237,0.15)',
              color: i <= current ? '#fff' : '#475569',
              fontSize: 11, fontWeight: 700, transition: 'all .3s',
            }}>
              {i < current ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : s.icon}
            </div>
            <span style={{ fontSize: 10, color: i === current ? '#94a3b8' : '#475569', fontWeight: i === current ? 600 : 400 }}>{s.label}</span>
          </div>
          {i < 2 && (
            <div style={{ width: 48, height: 2, margin: '0 4px', marginBottom: 16, background: i < current ? '#10b981' : 'rgba(99,179,237,0.1)', transition: 'background .3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── reusable input ─────────────────────────────────────────────────────────
const Input = ({ label, type = 'text', value, onChange, placeholder, autoFocus, suffix }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
        style={{
          width: '100%', padding: '11px 14px', paddingRight: suffix ? 44 : 14,
          borderRadius: 8, background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(99,179,237,0.18)', color: '#f8fafc',
          fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.55)'}
        onBlur={e => e.target.style.borderColor = 'rgba(99,179,237,0.18)'}
      />
      {suffix}
    </div>
  </div>
);

// ── error box ──────────────────────────────────────────────────────────────
const Err = ({ msg }) => msg ? (
  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '9px 13px', color: '#ef4444', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
    ⚠ {msg}
  </div>
) : null;

// ══════════════════════════════════════════════════════════════════════════
// STEP 1 — Credentials
// ══════════════════════════════════════════════════════════════════════════
const StepCredentials = ({ onNext }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      if (res.data?.status === 'OTP_REQUIRED') {
        onNext(res.data.username);
      } else {
        setError('Unexpected response from server.');
      }
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" autoFocus />
      <Input
        label="Password"
        type={showPwd ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        suffix={
          <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
            {showPwd ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
          </button>
        }
      />
      <Err msg={error} />
      <button type="submit" disabled={!username || !password || loading} style={btnStyle(loading || !username || !password)}>
        {loading ? <><CircularProgress size={13} style={{ color: '#fff' }} /> Verifying...</> : 'Continue →'}
      </button>

      {/* User credential hints */}
      <div style={{ marginTop: 20, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 10, padding: 14 }}>
        <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>Demo Credentials</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px', fontSize: 12 }}>
          {[
            ['admin', 'admin123', '#8b5cf6', 'All Access'],
            ['accounts_user', 'acc123', '#3b82f6', 'Accounts'],
            ['cards_user', 'card123', '#06b6d4', 'Cards'],
            ['loans_user', 'loan123', '#10b981', 'Loans'],
          ].map(([user, pwd, color, label]) => (
            <button key={user} type="button"
              onClick={() => { setUsername(user); setPassword(pwd); }}
              style={{ textAlign: 'left', background: `rgba(${hexToRgb(color)},0.06)`, border: `1px solid rgba(${hexToRgb(color)},0.18)`, borderRadius: 7, padding: '6px 9px', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.12)`}
              onMouseLeave={e => e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.06)`}
            >
              <span style={{ display: 'block', color, fontWeight: 700, fontSize: 11 }}>{label}</span>
              <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{user}</span>
              <span style={{ color: '#475569' }}> / {pwd}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// STEP 2 — Phone entry
// ══════════════════════════════════════════════════════════════════════════
const StepPhone = ({ username, onNext }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(username, digits);
      onNext(digits, res.data.devOtp, res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '2px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <PhoneIphoneIcon sx={{ fontSize: 26, color: '#06b6d4' }} />
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Enter the mobile number to receive your OTP</p>
        <p style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>Signing in as <strong style={{ color: '#3b82f6' }}>{username}</strong></p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>Mobile Number</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ padding: '11px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,179,237,0.18)', color: '#94a3b8', fontSize: 14, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            🇮🇳 +91
          </div>
          <input
            autoFocus type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210" maxLength={10}
            style={{ flex: 1, padding: '11px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,179,237,0.18)', color: '#f8fafc', fontSize: 14, outline: 'none', fontFamily: 'monospace', letterSpacing: 2 }}
            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.55)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,179,237,0.18)'}
          />
        </div>
      </div>
      <Err msg={error} />
      <button type="submit" disabled={phone.length < 10 || loading} style={btnStyle(phone.length < 10 || loading)}>
        {loading ? <><CircularProgress size={13} style={{ color: '#fff' }} /> Sending OTP...</> : 'Send OTP →'}
      </button>
    </form>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// STEP 3 — OTP verification
// ══════════════════════════════════════════════════════════════════════════
const StepOtp = ({ username, phone, devOtp: initialDevOtp, sentMsg, onSuccess, onResend }) => {
  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [error, setError]       = useState('');
  const [errCode, setErrCode]   = useState('');   // WRONG_OTP | OTP_EXPIRED | MAX_ATTEMPTS | NO_OTP
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [devOtp, setDevOtp]     = useState(initialDevOtp);
  const [locked, setLocked]     = useState(false);
  const inputs = useRef([]);
  const autoSubmitTimer = useRef(null);
  const submitRef = useRef(null);          // always points to latest submit

  // auto-focus first box when step loads
  useEffect(() => { setTimeout(() => inputs.current[0]?.focus(), 100); }, []);

  // countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  // fill all boxes from devOtp string and trigger auto-submit
  const fillDevOtp = () => {
    if (!devOtp || devOtp.length !== 6) return;
    setDigits(devOtp.split(''));
    inputs.current[5]?.focus();
  };

  const handleKey = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (!val && e.nativeEvent.inputType === 'deleteContentBackward' && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const otp = digits.join('');

  const submit = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6 || loading || locked) return;
    setError(''); setErrCode('');
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(username, otp);
      const { token, username: user, role } = res.data;
      if (!token) throw new Error('No token received');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: user, role }));
      onSuccess({ username: user, role });
    } catch (err) {
      const code = err.response?.data?.code || '';
      const msg  = err.response?.data?.error || 'Verification failed. Please try again.';
      setErrCode(code);
      setError(msg);
      if (code === 'MAX_ATTEMPTS') {
        setLocked(true);   // disable inputs until resend
      } else {
        // show digits in error state briefly, then clear after 1.2s
        setTimeout(() => {
          setDigits(['', '', '', '', '', '']);
          inputs.current[0]?.focus();
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  // keep submitRef always pointing to the freshest submit (avoids stale closure in setTimeout)
  submitRef.current = submit;

  // auto-submit after ALL 6 digits entered — delayed 300ms so user can see what they typed
  useEffect(() => {
    clearTimeout(autoSubmitTimer.current);
    if (otp.length === 6 && !locked) {
      autoSubmitTimer.current = setTimeout(() => submitRef.current(), 300);
    }
    return () => clearTimeout(autoSubmitTimer.current);
  }, [otp, locked]); // eslint-disable-line

  const resend = async () => {
    setResending(true);
    try {
      const res = await onResend();
      setDevOtp(res?.devOtp || '');
      setCountdown(120);
      setDigits(['', '', '', '', '', '']);
      setError(''); setErrCode(''); setLocked(false);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } catch {
      setError('Failed to resend OTP. Try again.');
    } finally {
      setResending(false);
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // box border colour: error=red, filled=blue, empty=default
  const boxBorder = (d) => {
    if (errCode === 'MAX_ATTEMPTS') return '2px solid rgba(239,68,68,0.6)';
    if (error && d) return '2px solid rgba(239,68,68,0.5)';
    if (d) return '2px solid rgba(59,130,246,0.6)';
    return '2px solid rgba(99,179,237,0.2)';
  };
  const boxBg = (d) => {
    if (error && d) return 'rgba(239,68,68,0.08)';
    if (d) return 'rgba(59,130,246,0.08)';
    return 'rgba(255,255,255,0.03)';
  };

  return (
    <form onSubmit={submit}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <ShieldIcon sx={{ fontSize: 26, color: '#3b82f6' }} />
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{sentMsg || `OTP sent to +91 XXXXXX${phone?.slice(-4)}`}</p>
        <p style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>Enter the 6-digit code below</p>
      </div>

      {/* Dev mode OTP banner — click fills all boxes automatically */}
      {devOtp && (
        <button type="button" onClick={fillDevOtp} style={{
          width: '100%', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>⚡ Dev Mode — tap to fill OTP</span>
            <span style={{ fontSize: 10, color: '#92794a' }}>SMS not configured — click here to autofill</span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: 6, color: '#f59e0b', fontFamily: 'monospace' }}>{devOtp}</span>
        </button>
      )}

      {/* 6-box OTP input */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }} onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i} ref={el => inputs.current[i] = el}
            value={d} onChange={e => handleKey(i, e)}
            maxLength={1} inputMode="numeric"
            disabled={loading || locked}
            style={{
              width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
              borderRadius: 9, border: boxBorder(d), background: boxBg(d),
              color: '#f8fafc', outline: 'none', fontFamily: 'monospace',
              transition: 'border-color .15s, background .15s',
              opacity: (loading || locked) ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      <Err msg={error} />

      <button type="submit" disabled={otp.length !== 6 || loading || locked} style={btnStyle(otp.length !== 6 || loading || locked)}>
        {loading ? <><CircularProgress size={13} style={{ color: '#fff' }} /> Verifying...</> : 'Verify & Sign In'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#475569' }}>
        {locked ? (
          <button type="button" onClick={resend} disabled={resending}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {resending ? 'Sending...' : '↺ Request New OTP'}
          </button>
        ) : countdown > 0 ? (
          <>Resend OTP in <span style={{ color: '#94a3b8', fontWeight: 600 }}>{fmt(countdown)}</span></>
        ) : (
          <button type="button" onClick={resend} disabled={resending}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {resending ? 'Sending...' : '↺ Resend OTP'}
          </button>
        )}
      </div>
    </form>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN LOGIN PAGE — orchestrates steps
// ══════════════════════════════════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [step, setStep] = useState(0);          // 0=creds, 1=phone, 2=otp
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [sentMsg, setSentMsg] = useState('');

  const stepTitles = ['Sign In', 'Verify Mobile', 'Enter OTP'];
  const stepSubs = [
    'Access your NexaBank admin portal',
    'We\'ll send a one-time password',
    'Complete two-factor authentication',
  ];

  const handlePhoneSent = (ph, otp, msg) => {
    setPhone(ph);
    setDevOtp(otp);
    setSentMsg(msg);
    setStep(2);
  };

  const handleResend = async () => {
    const res = await authAPI.sendOtp(username, phone);
    setDevOtp(res.data.devOtp || '');
    setSentMsg(res.data.message);
    return res.data;   // StepOtp.resend needs this to update its local devOtp state
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* subtle background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(59,130,246,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      <div style={{ background: '#111827', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 18, padding: '36px 40px', width: '100%', maxWidth: 420, position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>N</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{stepTitles[step]}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>{stepSubs[step]}</div>
        </div>

        <Steps current={step} />

        {step === 0 && <StepCredentials onNext={(u) => { setUsername(u); setStep(1); }} />}
        {step === 1 && <StepPhone username={username} onNext={handlePhoneSent} />}
        {step === 2 && <StepOtp username={username} phone={phone} devOtp={devOtp} sentMsg={sentMsg} onSuccess={onLogin} onResend={handleResend} />}
      </div>
    </div>
  );
};

// ── helpers ────────────────────────────────────────────────────────────────
const btnStyle = (disabled) => ({
  width: '100%', padding: '11px', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? 'rgba(59,130,246,0.25)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  color: disabled ? '#475569' : '#fff', fontSize: 14, fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: 'inherit', transition: 'opacity .2s',
});

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
};

export default LoginPage;
