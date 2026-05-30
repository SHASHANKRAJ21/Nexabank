import React, { useEffect, useState } from 'react';
import { cardAPI, formatCurrency, formatDate, formatDateTime } from '../../services/api';
import CloseIcon from '@mui/icons-material/Close';

const networkColors = { VISA: '#1a56db', MASTERCARD: '#c62828', RUPAY: '#2e7d32', AMEX: '#0277bd' };
const cardBg = {
  VISA: 'linear-gradient(135deg, #1a237e, #283593)',
  MASTERCARD: 'linear-gradient(135deg, #b71c1c, #c62828)',
  RUPAY: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
  AMEX: 'linear-gradient(135deg, #01579b, #0277bd)',
};

const CardDetailModal = ({ card, onClose, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'transactions') {
      setTxLoading(true);
      cardAPI.getTransactions(card.cardNumber, 0, 10)
        .then(res => setTransactions(res.data?.content || []))
        .catch(console.error)
        .finally(() => setTxLoading(false));
    }
  }, [activeTab, card.cardNumber]);

  const handleBlock = async () => {
    setActionLoading(true);
    try {
      await cardAPI.block(card.id);
      onRefresh();
      onClose();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    setActionLoading(true);
    try {
      await cardAPI.unblock(card.id);
      onRefresh();
      onClose();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const usagePercent = card.creditLimit > 0
    ? Math.round((card.outstandingAmount / card.creditLimit) * 100)
    : 0;

  const usageColor = usagePercent > 80 ? 'red' : usagePercent > 50 ? 'amber' : 'green';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ minWidth: 600 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="modal-title" style={{ marginBottom: 4 }}>{card.customerName}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: networkColors[card.network] || '#94a3b8' }}>
              {card.maskedCardNumber} · {card.network}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge ${card.status?.toLowerCase()}`}>{card.status}</span>
            <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Visual Card */}
        <div className={`bank-card`} style={{
          background: cardBg[card.network] || 'linear-gradient(135deg, #1a237e, #283593)',
          marginBottom: 20, width: '100%'
        }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              {card.cardType} CARD
            </div>
            <div className="card-number">{card.maskedCardNumber}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 }}>Card Holder</div>
              <div className="card-holder">{card.customerName}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 }}>Expires</div>
              <div className="card-expiry">{formatDate(card.expiryDate)}</div>
            </div>
            <div className="card-network">{card.network}</div>
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
            {card.cardType === 'CREDIT' && (
              <div style={{ marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(99,179,237,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Credit Utilization</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: usagePercent > 80 ? '#ef4444' : '#10b981' }}>{usagePercent}%</div>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${usageColor}`} style={{ width: `${usagePercent}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ color: '#ef4444' }}>Used: {formatCurrency(card.outstandingAmount)}</span>
                  <span style={{ color: '#10b981' }}>Available: {formatCurrency(card.availableLimit)}</span>
                </div>
              </div>
            )}

            <div className="info-grid">
              {[
                { label: 'Account Number', value: card.accountNumber, mono: true },
                { label: 'Card Type', value: card.cardType },
                { label: 'Network', value: card.network },
                { label: 'Credit Limit', value: formatCurrency(card.creditLimit), mono: true },
                { label: 'Email', value: card.email },
                { label: 'Expiry Date', value: formatDate(card.expiryDate) },
                { label: 'Last Billing', value: formatDate(card.lastBillingDate) },
                { label: 'Next Billing', value: formatDate(card.nextBillingDate) },
                { label: 'Reward Points', value: parseInt(card.rewardPoints || 0).toLocaleString() },
                { label: 'Issued On', value: formatDate(card.createdAt) },
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
          txLoading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Amount</th><th>Merchant</th><th>Category</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="mono" style={{ color: '#ef4444' }}>-{formatCurrency(tx.amount)}</td>
                    <td className="primary">{tx.merchantName}</td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{tx.merchantCategory}</td>
                    <td><span className={`badge ${tx.status?.toLowerCase()}`}>{tx.status}</span></td>
                    <td>{formatDateTime(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'actions' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                className="btn btn-danger"
                onClick={handleBlock}
                disabled={card.status === 'BLOCKED' || actionLoading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                🔒 Block Card
              </button>
              <button
                className="btn btn-success"
                onClick={handleUnblock}
                disabled={card.status === 'ACTIVE' || actionLoading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                🔓 Unblock Card
              </button>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 6 }}>⚠ Important</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Blocking a card will immediately prevent all transactions. The customer should be notified before taking this action.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDetailModal;
