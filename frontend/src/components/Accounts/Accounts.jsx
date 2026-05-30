import React, { useEffect, useState, useCallback } from 'react';
import { accountAPI, formatCurrency, formatDateTime } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountDetailModal from './AccountDetailModal';

const ACCOUNT_TYPES = ['ALL', 'SAVINGS', 'CURRENT', 'SALARY', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'];

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await accountAPI.search(search, page, size);
      } else {
        res = await accountAPI.getAll(page, size);
      }
      setAccounts(res.data?.content || []);
      setTotalElements(res.data?.totalElements || 0);
      setTotalPages(res.data?.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, size, search]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const filteredAccounts = typeFilter === 'ALL'
    ? accounts
    : accounts.filter(a => a.accountType === typeFilter);

  const getStatusClass = (s) => s?.toLowerCase() || '';

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Account Management</div>
        <div className="page-subtitle">{totalElements.toLocaleString()} total accounts across all branches</div>
      </div>

      <div className="data-panel">
        <div className="panel-header">
          <div className="panel-title">All Accounts</div>
          <div className="panel-actions">
            <div className="filter-tabs">
              {ACCOUNT_TYPES.map(t => (
                <button key={t} className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}>
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-wrapper">
                <SearchIcon className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search name, account no, email..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>
              <RefreshIcon fontSize="small" /> Reset
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><div className="loading-text">Loading accounts...</div></div>
          ) : filteredAccounts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏦</div>
              <div className="empty-text">No accounts found</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer Name</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Branch</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(acc => (
                  <tr key={acc.id} onClick={() => setSelectedAccount(acc)}>
                    <td className="mono">{acc.accountNumber}</td>
                    <td className="primary">{acc.customerName}</td>
                    <td><span style={{ color: '#94a3b8', fontSize: 12 }}>{acc.accountType?.replace('_', ' ')}</span></td>
                    <td className="primary" style={{ color: '#10b981' }}>{formatCurrency(acc.balance)}</td>
                    <td>{acc.branchName}</td>
                    <td>{acc.city}</td>
                    <td><span className={`badge ${getStatusClass(acc.status)}`}>{acc.status}</span></td>
                    <td>{formatDateTime(acc.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={e => { e.stopPropagation(); setSelectedAccount(acc); }}>
                        <VisibilityIcon style={{ fontSize: 14 }} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Showing {Math.min(page * size + 1, totalElements)}–{Math.min((page + 1) * size, totalElements)} of {totalElements.toLocaleString()} accounts
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

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onRefresh={fetchAccounts}
        />
      )}
    </div>
  );
};

export default Accounts;
