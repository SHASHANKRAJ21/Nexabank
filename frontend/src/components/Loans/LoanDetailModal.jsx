import React, { useEffect, useState } from 'react';
import { loanAPI, formatCurrency, formatDate } from '../../services/api';
import CloseIcon from '@mui/icons-material/Close';

const LoanDetailModal = ({ loan, onClose }) => {
  const [emiSchedule, setEmiSchedule] = useState([]);
  const [emiLoading, setEmiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (activeTab === 'emi') {
      setEmiLoading(true);
      loanAPI.getEmiSchedule(loan.loanNumber, 0, 12)
        .then(res => setEmiSchedule(res.data?.content || []))
        .catch(console.error)
        .finally(() => setEmiLoading(false));
    }
  }, [activeTab, loan.loanNumber]);

  const repaymentPct = loan.tenureMonths > 0
    ? Math.round((loan.paidEmis / loan.tenureMonths) * 100)
    : 0;
  const progressColor = repaymentPct >= 75 ? '#10b981' : repaymentPct >= 40 ? '#3b82f6' : '#f59e0b';

  const loanTypeColors = {
    HOME_LOAN: '#3b82f6', PERSONAL_LOAN: '#8b5cf6', CAR_LOAN: '#06b6d4',
    EDUCATION_LOAN: '#10b981', BUSINESS_LOAN: '#f59e0b', GOLD_LOAN: '#fbbf24',
  };
  const typeColor = loanTypeColors[loan.loanType] || '#94a3b8';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ minWidth: 640, maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="modal-title" style={{ marginBottom: 4 }}>{loan.customerName}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: typeColor }}>
                {loan.loanNumber}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: `${typeColor}22`, color: typeColor
              }}>
                {loan.loanType?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge ${loan.status?.toLowerCase()}`}>{loan.status}</span>
            <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2744, #0f1e3d)',
          borderRadius: 12, padding: 20, marginBottom: 20,
          border: `1px solid ${typeColor}33`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16
        }}>
          {[
            { label: 'Principal', value: formatCurrency(loan.principalAmount), color: '#f8fafc' },
            { label: 'Outstanding', value: formatCurrency(loan.outstandingAmount), color: '#f59e0b' },
            { label: 'Monthly EMI', value: formatCurrency(loan.emiAmount), color: typeColor },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Repayment Progress */}
        <div style={{ marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(99,179,237,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Repayment Progress</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: progressColor }}>{repaymentPct}%</div>
          </div>
          <div className="progress-bar">
            <div style={{ height: '100%', borderRadius: 3, background: progressColor, width: `${repaymentPct}%`, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: '#10b981' }}>{loan.paidEmis} EMIs paid</span>
            <span style={{ color: '#f59e0b' }}>{loan.remainingEmis} EMIs remaining</span>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          {['details', 'emi'].map(tab => (
            <button key={tab} className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
              {tab === 'emi' ? 'EMI Schedule' : 'Details'}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="info-grid">
            {[
              { label: 'Account Number', value: loan.accountNumber, mono: true },
              { label: 'Interest Rate', value: `${loan.interestRate}% p.a.`, mono: true },
              { label: 'Tenure', value: `${loan.tenureMonths} months`, mono: true },
              { label: 'Email', value: loan.email },
              { label: 'Phone', value: loan.phone },
              { label: 'Collateral', value: loan.collateral },
              { label: 'Purpose', value: loan.purpose },
              { label: 'Start Date', value: formatDate(loan.startDate) },
              { label: 'End Date', value: formatDate(loan.endDate) },
              { label: 'Next EMI Date', value: formatDate(loan.nextEmiDate) },
            ].map(item => (
              <div key={item.label} className="info-row">
                <div className="info-label">{item.label}</div>
                <div className={`info-value ${item.mono ? 'mono' : ''}`}>{item.value || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emi' && (
          emiLoading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : emiSchedule.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">No EMI records found</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>EMI Amount</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Balance After</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {emiSchedule.map(emi => (
                  <tr key={emi.id}>
                    <td style={{ color: '#94a3b8' }}>{emi.emiNumber}</td>
                    <td className="mono primary">{formatCurrency(emi.amount)}</td>
                    <td className="mono" style={{ color: '#10b981' }}>{formatCurrency(emi.principalComponent)}</td>
                    <td className="mono" style={{ color: '#f59e0b' }}>{formatCurrency(emi.interestComponent)}</td>
                    <td className="mono">{formatCurrency(emi.balanceAfter)}</td>
                    <td className="mono">{formatDate(emi.dueDate)}</td>
                    <td><span className={`badge ${emi.status?.toLowerCase()}`}>{emi.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default LoanDetailModal;
