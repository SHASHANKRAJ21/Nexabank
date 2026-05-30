import React, { useEffect, useState, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import { accountAPI, fmt } from '../../services/api';

const Statement = ({ accountNumber }) => {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [totalPages, setTotal] = useState(1);
  const [filter, setFilter]   = useState('ALL');   // ALL | CREDIT | DEBIT
  const [search, setSearch]   = useState('');

  const load = useCallback((p = 0) => {
    if (!accountNumber) { setLoading(false); return; }
    setLoading(true);
    accountAPI.getTransactions(accountNumber, p, 15)
      .then(r => {
        const d = r.data?.data || r.data;
        setTxns(d?.content || []);
        setTotal(d?.totalPages || 1);
        setPage(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountNumber]);

  useEffect(() => { load(0); }, [load]);

  const filtered = txns.filter(tx => {
    if (filter !== 'ALL' && tx.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (tx.description || '').toLowerCase().includes(q) ||
             (tx.transactionId || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalCredit = filtered.filter(t => t.type === 'CREDIT').reduce((s, t) => s + (t.amount || 0), 0);
  const totalDebit  = filtered.filter(t => t.type === 'DEBIT').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 17, color: '#10b981' }} />
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Total Credits (page)</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{fmt.currency(totalCredit)}</p>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDownIcon sx={{ fontSize: 17, color: '#ef4444' }} />
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Total Debits (page)</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{fmt.currency(totalDebit)}</p>
        </div>
      </div>

      <div className="page-card">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL','CREDIT','DEBIT'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                background: filter === f ? (f === 'CREDIT' ? '#10b981' : f === 'DEBIT' ? '#ef4444' : '#3b82f6') : 'rgba(99,179,237,0.08)',
                color: filter === f ? '#fff' : '#94a3b8',
              }}>{f}</button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by description or ID..."
            className="form-input" style={{ flex: 1, minWidth: 200 }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="spinner"><CircularProgress sx={{ color: '#10b981' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><p>No transactions found</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Balance After</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.transactionId}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{fmt.date(tx.createdAt)}</td>
                    <td>
                      <p style={{ color: '#f8fafc', fontWeight: 500 }}>{tx.description || '—'}</p>
                      {tx.referenceNumber && <p style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>REF: {tx.referenceNumber.slice(0,12)}...</p>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {tx.type === 'CREDIT' ? <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: '#ef4444' }} />}
                        <span className={`badge ${tx.type === 'CREDIT' ? 'green' : 'red'}`}>{tx.type}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'CREDIT' ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{fmt.currency(tx.amount)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{fmt.currency(tx.balanceAfter)}</td>
                    <td><span className={`badge ${tx.status === 'SUCCESS' ? 'green' : tx.status === 'FAILED' ? 'red' : 'amber'}`}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 }}>
            <button disabled={page === 0} onClick={() => load(page - 1)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(99,179,237,0.15)', background: 'rgba(255,255,255,0.03)', color: page === 0 ? '#475569' : '#94a3b8', cursor: page === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 12 }}>← Prev</button>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Page {page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => load(page + 1)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(99,179,237,0.15)', background: 'rgba(255,255,255,0.03)', color: page >= totalPages - 1 ? '#475569' : '#94a3b8', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statement;
