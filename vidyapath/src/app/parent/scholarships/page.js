'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export default function ParentScholarshipsPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'scholarship', category: '', grade: '', search: '', minAmount: '', maxAmount: '', deadlineDays: '' });
  const [activeTab, setActiveTab] = useState('scholarship');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: activeTab };
      if (filters.category) params.category = filters.category;
      if (filters.grade) params.grade = filters.grade;
      if (filters.search) params.search = filters.search;
      const res = await api.getOpportunities(params);
      setOpportunities(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeTab, filters]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => { e.preventDefault(); fetchData(); };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (filters.minAmount) {
      const minAmount = Number(filters.minAmount);
      const amount = Number(opp.rewards?.cashAmount || 0);
      if (amount < minAmount) return false;
    }
    if (filters.maxAmount) {
      const maxAmount = Number(filters.maxAmount);
      const amount = Number(opp.rewards?.cashAmount || 0);
      if (amount > maxAmount) return false;
    }
    if (filters.deadlineDays && opp.dates?.applicationDeadline) {
      const daysLeft = Math.ceil((new Date(opp.dates.applicationDeadline) - new Date()) / (1000*60*60*24));
      if (daysLeft > Number(filters.deadlineDays)) return false;
    }
    if (filters.deadlineDays && !opp.dates?.applicationDeadline) return false;
    return true;
  });

  const tabs = [
    { key: 'scholarship', label: '🎓 Scholarships', color: '#2563EB' },
    { key: 'competition', label: '🏆 Competitions', color: '#F59E0B' },
    { key: 'scheme', label: '🏛️ Govt. Schemes', color: '#059669' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>
        Opportunities for Your Child 🎓
      </h1>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>
        Browse scholarships, competitions, and government schemes across India.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px', border: 'none', borderRadius: '100px',
              fontSize: '13px', fontWeight: '800', cursor: 'pointer',
              background: activeTab === tab.key ? tab.color : '#F3F4F6',
              color: activeTab === tab.key ? 'white' : '#6B7280',
              transition: 'all 0.3s ease',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search opportunities..." value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={{ flex: '1', minWidth: '200px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }}
        />
        <select value={filters.grade} onChange={(e) => setFilters({...filters, grade: e.target.value})}
          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">All Grades</option>
          {[...Array(12)].map((_, i) => <option key={i} value={i+1}>Grade {i+1}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}
          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">All Categories</option>
          <option value="academic">Academic</option><option value="science">Science</option>
          <option value="arts">Arts</option><option value="coding">Coding</option>
          <option value="quiz">Quiz</option><option value="olympiad">Olympiad</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min ₹"
          value={filters.minAmount}
          onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
          style={{ width: '120px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}
        />
        <input
          type="number"
          min="0"
          placeholder="Max ₹"
          value={filters.maxAmount}
          onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
          style={{ width: '120px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}
        />
        <select value={filters.deadlineDays} onChange={(e) => setFilters({...filters, deadlineDays: e.target.value})}
          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">Any Deadline</option>
          <option value="7">Within 7 days</option>
          <option value="30">Within 30 days</option>
          <option value="60">Within 60 days</option>
        </select>
        <button type="submit" style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>Search</button>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading opportunities...</div>
      ) : filteredOpportunities.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px',
          padding: '60px', textAlign: 'center', color: '#6B7280',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>No opportunities found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredOpportunities.map((opp) => {
            const daysLeft = opp.dates?.applicationDeadline
              ? Math.max(0, Math.ceil((new Date(opp.dates.applicationDeadline) - new Date()) / (1000*60*60*24)))
              : null;

            return (
              <div key={opp._id} style={{
                background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px',
                padding: '28px', transition: 'all 0.3s ease',
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    textTransform: 'uppercase',
                    background: opp.type === 'scholarship' ? '#EFF6FF' : opp.type === 'competition' ? '#FFFBEB' : '#ECFDF5',
                    color: opp.type === 'scholarship' ? '#2563EB' : opp.type === 'competition' ? '#D97706' : '#059669',
                  }}>{opp.type}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', background: '#F3F4F6', color: '#6B7280' }}>
                    {opp.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px', lineHeight: '1.3' }}>
                  {opp.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
                  {opp.organizer?.name}
                </p>

                {opp.eligibility?.grades?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {opp.eligibility.grades.slice(0, 4).map(g => (
                      <span key={g} style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#F3F4F6', color: '#6B7280' }}>
                        Grade {g}
                      </span>
                    ))}
                    {opp.eligibility.grades.length > 4 && (
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#F3F4F6', color: '#6B7280' }}>
                        +{opp.eligibility.grades.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #F3F4F6' }}>
                  {opp.rewards?.cashAmount > 0 && (
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>
                      ₹{opp.rewards.cashAmount.toLocaleString('en-IN')}
                    </span>
                  )}
                  {daysLeft !== null && (
                    <span style={{
                      fontSize: '12px', fontWeight: '700',
                      color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#F59E0B' : '#6B7280',
                    }}>
                      ⏰ {daysLeft} days left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
