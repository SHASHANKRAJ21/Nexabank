import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { accountAPI, cardAPI, loanAPI, fmt } from '../../services/api';

const Dashboard = ({ accountNumber }) => {
  const navigate = useNavigate();
  const [account, setAccount]  = useState(null);
  const [txns, setTxns]        = useState([]);
  const [cards, setCards]       = useState([]);
  const [loans, setLoans]       = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!accountNumber) { setLoading(false); return; }
    Promise.all([
      accountAPI.getByNumber(accountNumber),
      accountAPI.getTransactions(accountNumber, 0, 5),
      cardAPI.getByAccount(accountNumber),
      loanAPI.getByAccount(accountNumber),
    ]).then(([a, t, c, l]) => {
      setAccount(a.data?.data || a.data);
      setTxns((t.data?.data?.content || t.data?.content || []).slice(0, 5));
      setCards(c.data?.data || c.data || []);
      setLoans(l.data?.data || l.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [accountNumber]);

  if (loading) return <div className="spinner"><CircularProgress sx={{ color: '#10b981' }} /></div>;

  const activeCards  = cards.filter(c => c.status === 'ACTIVE').length;
  const activeLoans  = loans.filter(l => l.status === 'ACTIVE').length;
  const totalOutstanding = loans.reduce((s, l) => s + (l.outstandingAmount || 0), 0);

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>Good day! 👋</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Here's your financial overview</p>
      </div>

      {/* Balance hero card */}
      {account && (
        <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.1))', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 18, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(16,185,129,0.06)' }} />
          <div style={{ position: 'absolute', right: 40, bottom: -40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(6,182,212,0.06)' }} />
          <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Available Balance</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>{fmt.currency(account.balance)}</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            {account.accountType?.replace('_', ' ')} · <span style={{ fontFamily: 'monospace', color: '#10b981' }}>{account.accountNumber}</span>
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/statement')} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              View Statement
            </button>
            <button onClick={() => navigate('/account')} style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(99,179,237,0.2)', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Account Details
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Active Cards',     value: activeCards,             icon: <CreditCardIcon sx={{ fontSize: 20, color: '#06b6d4' }} />, color: '#06b6d4', path: '/cards' },
          { label: 'Active Loans',     value: activeLoans,             icon: <PaymentsIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />,   color: '#8b5cf6', path: '/loans' },
          { label: 'Loan Outstanding', value: fmt.currency(totalOutstanding), icon: <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#f59e0b' }} />, color: '#f59e0b', path: '/loans' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.path)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `rgba(${s.color === '#06b6d4' ? '6,182,212' : s.color === '#8b5cf6' ? '139,92,246' : '245,158,11'},.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <ArrowForwardIcon sx={{ fontSize: 14, color: '#475569' }} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Recent Transactions</h2>
          <button onClick={() => navigate('/statement')} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
            View all <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </button>
        </div>
        {txns.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><p>No transactions yet</p></div>
        ) : (
          txns.map(tx => (
            <div key={tx.transactionId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(99,179,237,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: tx.type === 'CREDIT' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tx.type === 'CREDIT' ? <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#f8fafc' }}>{tx.description || tx.type}</p>
                  <p style={{ fontSize: 11, color: '#475569' }}>{fmt.date(tx.createdAt)}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === 'CREDIT' ? '#10b981' : '#ef4444' }}>
                  {tx.type === 'CREDIT' ? '+' : '-'}{fmt.currency(tx.amount)}
                </p>
                <p style={{ fontSize: 11, color: '#475569' }}>Bal: {fmt.currency(tx.balanceAfter)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
