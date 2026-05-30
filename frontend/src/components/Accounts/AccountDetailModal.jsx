import React, { useEffect, useState } from 'react';
import { accountAPI, formatCurrency, formatDateTime, formatDate } from '../../services/api';
import CloseIcon from '@mui/icons-material/Close';
import SwapVertIcon from '@mui/icons-material/SwapVert';

const AccountDetailModal = ({ account, onClose, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (activeTab === 'transactions') {
      setTxLoading(true);
      accountAPI.getTransactions(account.accountNumber, 0, 10)
        .then(res => setTransactions(res.data?.content || []))
        .catch(console.error)
        .finally(() => setTxLoading(false));
    }
  }, [activeTab, account.accountNumber]);

  const handleStatusChange = async (newStatus) => {
    try {
      await accountAPI.updateStatus(account.id, newStatus);
      onRefresh();
      onClose();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.message || e.message));
    }
  };

  const utilization = account.balance > 0
    ? Math.min(100, (account.balance / 5000000) * 100)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ minWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="modal-title" style={{ marginBottom: 4 }}>{account.customerName}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#3b82f6' }}>
              {account.accountNumber}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge ${account.status?.toLowerCase()}`}>{account.status}</span>
            <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          {['details', 'transactions', 'actions'].map(tab => (
            <button key={tab} className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #1a2744, #0f1e3d)',
              borderRadius: 12, padding: 20, marginBottom: 20,
              border: '1px solid rgba(59,130,246,0.2)'
            }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>CURRENT BALANCE</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                {formatCurrency(account.balance)}
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                  <div className="progress-fill blue" style={{ width: `${utilization}%` }} />
                </div>
              </div>
            </div>

            <div className="info-grid">
              {[
                { label: 'Account Type', value: account.accountType?.replace('_', ' ') },
                { label: 'IFSC Code', value: account.ifscCode, mono: true },
                { label: 'Email', value: account.email },
                { label: 'Phone', value: account.phone },
                { label: 'Branch', value: account.branchName },
                { label: 'City', value: account.city },
                { label: 'State', value: account.state },
                { label: 'Opened On', value: formatDate(account.createdAt) },
              ].map(item => (
                <div key={item.label} className="info-row">
                  <div className="info-label">{item.label}</div>
                  <div className={`info-value ${item.mono ? 'mono' : ''}`}>{item.value || '—'}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <div>
            {txLoading ? (
              <div className="loading-overlay"><div className="spinner" /></div>
            ) : transactions.length === 0 ? (
              <div className="empty-state"><div className="empty-icon"><SwapVertIcon /></div><div>No transactions found</div></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td><span className={`badge ${tx.type?.toLowerCase()}`}>{tx.type}</span></td>
                      <td className="primary" style={{ color: tx.type === 'CREDIT' ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="mono">{formatCurrency(tx.balanceAfter)}</td>
                      <td>{tx.description}</td>
                      <td>{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Change Account Status</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'].map(s => (
                  <button
                    key={s}
                    className={`btn ${s === 'ACTIVE' ? 'btn-success' : s === 'SUSPENDED' || s === 'CLOSED' ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={account.status === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 10, padding: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 6 }}>⚠ Caution</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Status changes are permanent and may affect the customer's banking services.
                Please verify before proceeding.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetailModal;
