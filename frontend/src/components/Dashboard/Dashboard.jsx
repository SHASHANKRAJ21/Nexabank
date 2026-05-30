import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountAPI, cardAPI, loanAPI, formatCurrency } from '../../services/api';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const StatCard = ({ label, value, icon, color, subtitle }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {subtitle && <div className="stat-change">{subtitle}</div>}
  </div>
);

const Dashboard = () => {
  const [accountStats, setAccountStats] = useState(null);
  const [cardStats, setCardStats] = useState(null);
  const [loanStats, setLoanStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      accountAPI.getDashboardStats(),
      cardAPI.getDashboardStats(),
      loanAPI.getDashboardStats(),
    ]).then(([a, c, l]) => {
      setAccountStats(a.data);
      setCardStats(c.data);
      setLoanStats(l.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { label: 'Manage Accounts', path: '/accounts', icon: <AccountBalanceIcon />, color: '#3b82f6', desc: 'View & manage all bank accounts' },
    { label: 'Manage Cards', path: '/cards', icon: <CreditCardIcon />, color: '#06b6d4', desc: 'Credit, debit & prepaid cards' },
    { label: 'Manage Loans', path: '/loans', icon: <AssessmentIcon />, color: '#8b5cf6', desc: 'Home, personal, car & more' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Welcome back, Admin</div>
        <div className="page-subtitle">Here's an overview of NexaBank's operations today</div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><div className="loading-text">Loading dashboard...</div></div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Accounts" value={accountStats?.totalAccounts?.toLocaleString() || '—'} icon={<PeopleIcon />} color="blue" subtitle={`${accountStats?.activeAccounts?.toLocaleString()} active`} />
            <StatCard label="Total Deposits" value={formatCurrency(accountStats?.totalDeposits)} icon={<MonetizationOnIcon />} color="green" subtitle="Across all accounts" />
            <StatCard label="Active Cards" value={cardStats?.activeCards?.toLocaleString() || '—'} icon={<CreditCardIcon />} color="cyan" subtitle={`${cardStats?.totalCards?.toLocaleString()} total cards`} />
            <StatCard label="Card Outstanding" value={formatCurrency(cardStats?.totalOutstanding)} icon={<TrendingUpIcon />} color="amber" subtitle="Total outstanding amount" />
            <StatCard label="Active Loans" value={loanStats?.activeLoans?.toLocaleString() || '—'} icon={<AssessmentIcon />} color="purple" subtitle={`${loanStats?.totalLoans?.toLocaleString()} total loans`} />
            <StatCard label="Loan Portfolio" value={formatCurrency(loanStats?.totalDisbursed)} icon={<AccountBalanceIcon />} color="blue" subtitle={`${formatCurrency(loanStats?.totalOutstanding)} outstanding`} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 16 }}>Quick Access</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {quickLinks.map(link => (
                <div
                  key={link.path}
                  className="data-panel"
                  style={{ padding: 24, cursor: 'pointer' }}
                  onClick={() => navigate(link.path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${link.color}22`,
                      color: link.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24
                    }}>
                      {link.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>{link.label}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{link.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="data-panel" style={{ padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 20 }}>Service Endpoints</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { name: 'Account Service', port: 8081, color: '#3b82f6' },
                { name: 'Card Service', port: 8082, color: '#06b6d4' },
                { name: 'Loan Service', port: 8083, color: '#8b5cf6' },
              ].map(svc => (
                <div key={svc.name} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(99,179,237,0.1)',
                  borderRadius: 10, padding: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{svc.name}</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: svc.color }}>
                    localhost:{svc.port}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#475569', marginTop: 4 }}>
                    /swagger-ui.html
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
