import React, { useEffect, useState, useCallback } from 'react';
import { cardAPI, formatCurrency, formatDate } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CardDetailModal from './CardDetailModal';

const CARD_TYPES = ['ALL', 'CREDIT', 'DEBIT', 'PREPAID'];

const networkColors = {
  VISA: '#1a56db',
  MASTERCARD: '#c62828',
  RUPAY: '#2e7d32',
  AMEX: '#0277bd',
};

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await cardAPI.search(search, page, size);
      } else if (typeFilter !== 'ALL') {
        res = await cardAPI.getByType(typeFilter, page, size);
      } else {
        res = await cardAPI.getAll(page, size);
      }
      setCards(res.data?.content || []);
      setTotalElements(res.data?.totalElements || 0);
      setTotalPages(res.data?.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, size, search, typeFilter]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Card Management</div>
        <div className="page-subtitle">{totalElements.toLocaleString()} total cards issued</div>
      </div>

      <div className="data-panel">
        <div className="panel-header">
          <div className="panel-title">All Cards</div>
          <div className="panel-actions">
            <div className="filter-tabs">
              {CARD_TYPES.map(t => (
                <button key={t} className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => { setTypeFilter(t); setPage(0); setSearch(''); setSearchInput(''); }}>
                  {t}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-wrapper">
                <SearchIcon className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search name, card no, account..."
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
            <div className="loading-overlay"><div className="spinner" /><div className="loading-text">Loading cards...</div></div>
          ) : cards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <div className="empty-text">No cards found</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Card Number</th>
                  <th>Customer Name</th>
                  <th>Type</th>
                  <th>Network</th>
                  <th>Credit Limit</th>
                  <th>Outstanding</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Reward Pts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.id} onClick={() => setSelectedCard(card)}>
                    <td className="mono">{card.maskedCardNumber}</td>
                    <td className="primary">{card.customerName}</td>
                    <td><span style={{ fontSize: 12, color: '#94a3b8' }}>{card.cardType}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 12, color: networkColors[card.network] || '#94a3b8' }}>
                        {card.network}
                      </span>
                    </td>
                    <td className="mono">{formatCurrency(card.creditLimit)}</td>
                    <td className="mono" style={{ color: card.outstandingAmount > 0 ? '#f59e0b' : '#94a3b8' }}>
                      {formatCurrency(card.outstandingAmount)}
                    </td>
                    <td className="mono">{formatDate(card.expiryDate)}</td>
                    <td><span className={`badge ${card.status?.toLowerCase()}`}>{card.status}</span></td>
                    <td style={{ color: '#8b5cf6', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      {parseInt(card.rewardPoints || 0).toLocaleString()}
                    </td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={e => { e.stopPropagation(); setSelectedCard(card); }}>
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
            Showing {Math.min(page * size + 1, totalElements)}–{Math.min((page + 1) * size, totalElements)} of {totalElements.toLocaleString()} cards
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

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} onRefresh={fetchCards} />
      )}
    </div>
  );
};

export default Cards;
