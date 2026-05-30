import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BadgeIcon from '@mui/icons-material/Badge';
import { accountAPI, fmt } from '../../services/api';

const Row = ({ label, value, mono, copy }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid rgba(99,179,237,0.07)' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, minWidth: 140 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#f8fafc', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: mono ? 600 : 400 }}>{value || '—'}</span>
        {copy && (
          <button onClick={doCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : '#475569', display: 'flex' }}>
            <ContentCopyIcon sx={{ fontSize: 13 }} />
          </button>
        )}
      </div>
    </div>
  );
};

const statusColor = s => ({ ACTIVE: 'green', INACTIVE: 'amber', SUSPENDED: 'red', CLOSED: 'red' }[s] || 'blue');

const AccountOverview = ({ accountNumber }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountNumber) { setLoading(false); return; }
    accountAPI.getByNumber(accountNumber)
      .then(r => setAccount(r.data?.data || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountNumber]);

  if (loading) return <div className="spinner"><CircularProgress sx={{ color: '#10b981' }} /></div>;
  if (!account) return <div className="empty-state"><div className="empty-icon">🏦</div><p>No account found</p></div>;

  return (
    <div>
      {/* Balance card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '28px 28px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: 'linear-gradient(135deg,#10b981,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountBalanceIcon sx={{ fontSize: 26, color: '#fff' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Current Balance</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc' }}>{fmt.currency(account.balance)}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className={`badge ${statusColor(account.status)}`}>{account.status}</span>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BadgeIcon sx={{ fontSize: 17, color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Account Details</h2>
        </div>
        <Row label="Account Number" value={account.accountNumber} mono copy />
        <Row label="Account Type"   value={account.accountType?.replace('_',' ')} />
        <Row label="Account Holder" value={account.customerName} />
        <Row label="Email"          value={account.email} />
        <Row label="Phone"          value={account.phone} />
        <Row label="Status"         value={account.status} />
        <Row label="Opened On"      value={fmt.date(account.createdAt)} />
      </div>

      {/* Bank details */}
      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocationCityIcon sx={{ fontSize: 17, color: '#06b6d4' }} />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Bank Details</h2>
        </div>
        <Row label="IFSC Code"   value={account.ifscCode}   mono copy />
        <Row label="Branch Name" value={account.branchName} />
        <Row label="City"        value={account.city} />
        <Row label="State"       value={account.state} />
      </div>
    </div>
  );
};

export default AccountOverview;
