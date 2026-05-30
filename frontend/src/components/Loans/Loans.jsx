import React, { useEffect, useState, useCallback } from 'react';
import { loanAPI, formatCurrency, formatDate } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoanDetailModal from './LoanDetailModal';

const LOAN_TYPES = ['ALL', 'HOME_LOAN', 'PERSONAL_LOAN', 'CAR_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN', 'GOLD_LOAN'];

const loanTypeColors = {
  HOME_LOAN: '#3b82f6',
  PERSONAL_LOAN: '#8b5cf6',
  CAR_LOAN: '#06b6d4',
  EDUCATION_LOAN: '#10b981',
  BUSINESS_LOAN: '#f59e0b',
  GOLD_LOAN: '#fbbf24',
};

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await loanAPI.search(search, page, size);
      } else if (typeFilter !== 'ALL') {
        res = await loanAPI.getByType(typeFilter, page, size);
      } else {
        res = await loanAPI.getAll(page, size);
      }
      setLoans(res.data?.content || []);
      setTotalElements(res.data?.totalElements || 0);
      setTotalPages(res.data?.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, size, search, typeFilter]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const repaymentPercent = (loan) => {
    if (!loan.tenureMonths) return 0;
    return Math.round((loan.paidEmis / loan.tenureMonths) * 100);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Loan Management</div>
        <div className="page-subtitle">{totalElements.toLocaleString()} total loans in portfolio</div>
      </div>

      <div className="data-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="panel-title">All Loans</div>
          <div className="panel-actions" style={{ flexWrap: 'wrap' }}>
            <div className="filter-tabs" style={{ flexWrap: 'wrap' }}>
              {LOAN_TYPES.map(t => (
                <button key={t} className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => { setTypeFilter(t); setPage(0); setSearch(''); setSearchInput(''); }}>
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-wrapper">
                <SearchIcon className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search name, loan no, account..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(0); setTypeFilter('ALL'); }}>
              <RefreshIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><div className="loading-text">Loading loans...</div></div>
          ) : loans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No loans found</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan Number</th>
                  <th>Customer Name</th>
                  <th>Type</th>
                  <th>Principal</th>
                  <th>Outstanding</th>
                  <th>EMI</th>
                  <th>Rate</th>
                  <th>Progress</th>
                  <th>Next EMI</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => {
                  const pct = repaymentPercent(loan);
                  const color = pct >= 75 ? 'green' : pct >= 40 ? 'blue' : 'amber';
                  return (
                    <tr key={loan.id} onClick={() => setSelectedLoan(loan)}>
                      <td className="mono">{loan.loanNumber}</td>
                      <td className="primary">{loan.customerName}</td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          background: `${loanTypeColors[loan.loanType]}22`,
                          color: loanTypeColors[loan.loanType] || '#94a3b8'
                        }}>
                          {loan.loanType?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="mono">{formatCurrency(loan.principalAmount)}</td>
                      <td className="mono" style={{ color: '#f59e0b' }}>{formatCurrency(loan.outstandingAmount)}</td>
                      <td className="mono">{formatCurrency(loan.emiAmount)}</td>
                      <td style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{loan.interestRate}%</td>
                      <td style={{ minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 30 }}>{pct}%</span>
                        </div>
                      </td>
                      <td className="mono">{formatDate(loan.nextEmiDate)}</td>
                      <td><span className={`badge ${loan.status?.toLowerCase()}`}>{loan.status}</span></td>
                      <td>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={e => { e.stopPropagation(); setSelectedLoan(loan); }}>
                          <VisibilityIcon style={{ fontSize: 14 }} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Showing {Math.min(page * size + 1, totalElements)}–{Math.min((page + 1) * size, totalElements)} of {totalElements.toLocaleString()} loans
          </div>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setPage(0)} disabled={page === 0}>«</button>
            <button className="page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
              return (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p + 1}
                </button>
              );
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
          </div>
        </div>
      </div>

      {selectedLoan && (
        <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
      )}
    </div>
  );
};

export default Loans;
