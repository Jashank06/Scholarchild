'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export default function ParentSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', city: '', board: '', type: '', search: '', verifiedOnly: false, minRating: '' });

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.board) params.board = filters.board;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      const res = await api.getSchools(params);
      setSchools(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const handleSearch = (e) => { e.preventDefault(); fetchSchools(); };

  const filteredSchools = schools.filter((school) => {
    if (filters.city && !school.address?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.verifiedOnly && !school.isVerified) return false;
    if (filters.minRating) {
      const rating = Number(school.ratings?.overall || 0);
      if (rating < Number(filters.minRating)) return false;
    }
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Schools Directory 🏫</h1>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>Browse and review schools across India.</p>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search schools..."
          value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={{ flex: '1', minWidth: '200px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }}
        />
        <input
          type="text" placeholder="State"
          value={filters.state} onChange={(e) => setFilters({...filters, state: e.target.value})}
          style={{ minWidth: '160px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}
        />
        <input
          type="text" placeholder="City"
          value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}
          style={{ minWidth: '160px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}
        />
        <select value={filters.board} onChange={(e) => setFilters({...filters, board: e.target.value})}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}>
          <option value="">All Boards</option>
          <option value="CBSE">CBSE</option><option value="ICSE">ICSE</option><option value="State">State</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}>
          <option value="">All Types</option>
          <option value="government">Government</option><option value="private">Private</option><option value="aided">Aided</option>
        </select>
        <select value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: e.target.value})}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}>
          <option value="">Any Rating</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
          <option value="2">2★ & above</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#6B7280' }}>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
          />
          Verified only
        </label>
        <button type="submit" style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>Search</button>
      </form>

      {/* School List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading schools...</div>
      ) : filteredSchools.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px',
          padding: '60px', textAlign: 'center', color: '#6B7280',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏫</div>
          <p>No schools found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredSchools.map((school) => (
            <div key={school._id} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px',
              padding: '28px', transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A' }}>{school.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    {school.address?.city}, {school.address?.state}
                  </p>
                </div>
                {school.isVerified && <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '100px' }}>✓ Verified</span>}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {school.board && <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '100px' }}>{school.board}</span>}
                {school.type && <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '4px 10px', borderRadius: '100px', textTransform: 'capitalize' }}>{school.type}</span>}
              </div>
              {school.ratings?.overall > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B' }}>⭐ {school.ratings.overall.toFixed(1)}</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>({school.ratings.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
