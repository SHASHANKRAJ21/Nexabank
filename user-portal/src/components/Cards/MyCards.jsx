import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { cardAPI, fmt } from '../../services/api';

const networkColor = n => ({ VISA: '#1a1f71', MASTERCARD: '#eb001b', RUPAY: '#097739', AMEX: '#016fcb' }[n] || '#111827');
const networkEmoji = n => ({ VISA: 'VISA', MASTERCARD: '●●', RUPAY: 'RuPay', AMEX: 'AMEX' }[n] || n);

const statusBadge = s => ({ ACTIVE: 'green', BLOCKED: 'red', EXPIRED: 'amber', CANCELLED: 'red', PENDING_ACTIVATION: 'blue' }[s] || 'blue');

const MyCards = ({ accountNumber }) => {
  const [cards, setCards]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [txns, setTxns]     = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (!accountNumber) { setLoading(false); return; }
    cardAPI.getByAccount(accountNumber)
      .then(r => {
        const data = r.data?.data || r.data || [];
        setCards(data);
        if (data.length > 0) loadCardTxns(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountNumber]);

  const loadCardTxns = (card) => {
    setSelected(card);
    setTxLoading(true);
    cardAPI.getTransactions(card.cardNumber, 0, 10)
      .then(r => setTxns((r.data?.data?.content || r.data?.content || []).slice(0, 10)))
      .catch(console.error)
      .finally(() => setTxLoading(false));
  };

  if (loading) return <div className="spinner"><CircularProgress sx={{ color: '#10b981' }} /></div>;
  if (cards.length === 0) return <div className="empty-state"><div className="empty-icon">💳</div><p>No cards linked to this account</p></div>;

  return (
    <div>
      {/* Card list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, marginBottom: 22 }}>
        {cards.map(card => {
          const isSelected = selected?.cardNumber === card.cardNumber;
          return (
            <div key={card.cardNumber} onClick={() => loadCardTxns(card)}
              style={{ borderRadius: 14, padding: '20px 22px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all .2s',
                background: isSelected ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.15))' : '#111827',
                border: isSelected ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(99,179,237,0.1)',
              }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCardIcon sx={{ fontSize: 18, color: '#10b981' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${statusBadge(card.status)}`}>{card.status}</span>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{card.cardType}</p>
                </div>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2, color: '#f8fafc', marginBottom: 14 }}>{card.maskedCardNumber}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Card Holder</p>
                  <p style={{ fontSize: 12, color: '#f8fafc', fontWeight: 600 }}>{card.customerName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Expires</p>
                  <p style={{ fontSize: 12, color: '#f8fafc', fontFamily: 'monospace' }}>{card.expiryDate}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Network</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{card.network}</p>
                </div>
              </div>
              {card.creditLimit && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(99,179,237,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Used</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmt.currency(card.outstandingAmount)} / {fmt.currency(card.creditLimit)}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(99,179,237,0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#10b981,#06b6d4)', width: `${Math.min(100, ((card.outstandingAmount || 0) / (card.creditLimit || 1)) * 100)}%` }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Available: {fmt.currency(card.availableLimit)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected card transactions */}
      {selected && (
        <div className="page-card">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
            Recent Transactions — {selected.maskedCardNumber}
          </h2>
          {txLoading ? <div className="spinner"><CircularProgress sx={{ color: '#10b981' }} /></div>
            : txns.length === 0 ? <div className="empty-state"><div className="empty-icon">📋</div><p>No transactions</p></div>
            : (
              <table className="data-table">
                <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {txns.map(tx => (
                    <tr key={tx.transactionId}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{fmt.date(tx.createdAt)}</td>
                      <td style={{ color: '#f8fafc', fontWeight: 500 }}>{tx.merchantName || '—'}</td>
                      <td><span className="badge blue">{tx.merchantCategory || '—'}</span></td>
                      <td><span className={`badge ${tx.status === 'SUCCESS' ? 'green' : 'red'}`}>{tx.status}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>-{fmt.currency(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      )}
    </div>
  );
};

export default MyCards;
