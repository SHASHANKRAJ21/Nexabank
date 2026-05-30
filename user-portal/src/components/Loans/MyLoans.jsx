import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { loanAPI, fmt } from '../../services/api';

const statusBadge = s => ({ ACTIVE:'green', CLOSED:'blue', NPA:'red', DISBURSED:'teal', APPROVED:'amber', REJECTED:'red' }[s] || 'blue');
const typeIcon = t => ({ HOME_LOAN:'🏠', CAR_LOAN:'🚗', EDUCATION_LOAN:'🎓', PERSONAL_LOAN:'💼', BUSINESS_LOAN:'🏢', GOLD_LOAN:'🥇' }[t] || '💰');

const EmiSchedule = ({ loanNumber }) => {
  const [emis, setEmis]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(0);
  const [total, setTotal]   = useState(1);

  const load = (p = 0) => {
    setLoading(true);
    loanAPI.getEmiSchedule(loanNumber, p, 10)
      .then(r => {
        const d = r.data?.data || r.data;
        setEmis(d?.content || []);
        setTotal(d?.totalPages || 1);
        setPage(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); }, [loanNumber]);

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}><CircularProgress size={22} sx={{ color: '#10b981' }} /></div>;

  return (
    <div style={{ marginTop: 12 }}>
      <table className="data-table">
        <thead>
          <tr><th>#</th><th>Due Date</th><th>EMI Amount</th><th>Principal</th><th>Interest</th><th>Balance After</th><th>Status</th></tr>
        </thead>
        <tbody>
          {emis.map(e => (
            <tr key={e.emiNumber}>
              <td style={{ fontWeight: 600, color: '#f8fafc' }}>{e.emiNumber}</td>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{fmt.date(e.dueDate)}</td>
              <td style={{ fontWeight: 600, color: '#f8fafc' }}>{fmt.currency(e.amount)}</td>
              <td style={{ color: '#06b6d4' }}>{fmt.currency(e.principalComponent)}</td>
              <td style={{ color: '#f59e0b' }}>{fmt.currency(e.interestComponent)}</td>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{fmt.currency(e.balanceAfter)}</td>
              <td><span className={`badge ${e.status === 'PAID' ? 'green' : e.status === 'OVERDUE' ? 'red' : 'amber'}`}>{e.status || 'PENDING'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {total > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <button disabled={page === 0} onClick={() => load(page-1)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(99,179,237,0.15)', background: 'rgba(255,255,255,0.03)', color: page===0 ? '#475569' : '#94a3b8', cursor: page===0 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>← Prev</button>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{page+1}/{total}</span>
          <button disabled={page>=total-1} onClick={() => load(page+1)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(99,179,237,0.15)', background: 'rgba(255,255,255,0.03)', color: page>=total-1 ? '#475569' : '#94a3b8', cursor: page>=total-1 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Next →</button>
        </div>
      )}
    </div>
  );
};

const MyLoans = ({ accountNumber }) => {
  const [loans, setLoans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!accountNumber) { setLoading(false); return; }
    loanAPI.getByAccount(accountNumber)
      .then(r => setLoans(r.data?.data || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountNumber]);

  if (loading) return <div className="spinner"><CircularProgress sx={{ color: '#10b981' }} /></div>;
  if (loans.length === 0) return <div className="empty-state"><div className="empty-icon">💳</div><p>No loans found for this account</p></div>;

  return (
    <div>
      {loans.map(loan => {
        const pct = Math.min(100, ((loan.paidEmis || 0) / (loan.tenureMonths || 1)) * 100);
        const isOpen = expanded === loan.loanNumber;
        return (
          <div key={loan.loanNumber} className="page-card" style={{ marginBottom: 14 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {typeIcon(loan.loanType)}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>{(loan.loanType || '').replace(/_/g,' ')}</p>
                  <p style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{loan.loanNumber}</p>
                </div>
              </div>
              <span className={`badge ${statusBadge(loan.status)}`}>{loan.status}</span>
            </div>

            {/* Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
              {[
                { label: 'Principal',    value: fmt.currency(loan.principalAmount),  color: '#f8fafc' },
                { label: 'Outstanding', value: fmt.currency(loan.outstandingAmount), color: '#ef4444' },
                { label: 'EMI Amount',  value: fmt.currency(loan.emiAmount),          color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 9 }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: '#94a3b8' }}>
                <span>{loan.paidEmis} EMIs paid</span>
                <span>{loan.remainingEmis} remaining · {loan.interestRate}% p.a.</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(99,179,237,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#10b981,#06b6d4)', width: `${pct}%`, transition: 'width .5s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: '#475569' }}>
                <span>Start: {fmt.date(loan.startDate)}</span>
                <span>End: {fmt.date(loan.endDate)}</span>
              </div>
            </div>

            {loan.nextEmiDate && (
              <p style={{ fontSize: 12, color: '#f59e0b', marginBottom: 12 }}>📅 Next EMI due: <strong>{fmt.date(loan.nextEmiDate)}</strong></p>
            )}

            {/* EMI Schedule toggle */}
            <button onClick={() => setExpanded(isOpen ? null : loan.loanNumber)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '7px 14px', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isOpen ? <ExpandLessIcon sx={{ fontSize: 15 }} /> : <ExpandMoreIcon sx={{ fontSize: 15 }} />}
              {isOpen ? 'Hide EMI Schedule' : 'View EMI Schedule'}
            </button>

            {isOpen && <EmiSchedule loanNumber={loan.loanNumber} />}
          </div>
        );
      })}
    </div>
  );
};

export default MyLoans;
