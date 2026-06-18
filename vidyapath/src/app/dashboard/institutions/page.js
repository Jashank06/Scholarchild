'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AddInstitutionModal from '@/components/schools/AddInstitutionModal';

export default function StudentInstitutionsPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', city: '', type: '', search: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      const res = await api.getInstitutions(params);
      setInstitutions(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  const handleSearch = (e) => { e.preventDefault(); fetchInstitutions(); };

  const filtered = institutions.filter((inst) => {
    if (filters.city && !inst.address?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Institutions Directory 🎓</h1>
          <p style={{ color: '#6B7280', marginBottom: '32px' }}>Browse ITI, Diploma, Colleges & Universities across India.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '12px 24px', background: '#0083B0', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          fontSize: '14px', whiteSpace: 'nowrap',
        }}>➕ Add Institution</button>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search institutions..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={{ flex: '1', minWidth: '200px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }} />
        <input type="text" placeholder="State" value={filters.state} onChange={(e) => setFilters({...filters, state: e.target.value})}
          style={{ minWidth: '160px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }} />
        <input type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}
          style={{ minWidth: '160px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }} />
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}>
          <option value="">All Types</option>
          <option value="ITI">ITI</option><option value="Diploma">Diploma</option><option value="College">College</option><option value="University">University</option>
        </select>
        <button type="submit" style={{ padding: '12px 24px', background: '#0083B0', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading institutions...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px', padding: '60px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
          <p>No institutions found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((inst) => (
            <div key={inst._id} onClick={() => router.push(`/dashboard/institutions/${inst._id}`)}
              style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '28px', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A' }}>{inst.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>📍 {inst.address?.city}, {inst.address?.state}</p>
                </div>
                {inst.isVerified && <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '100px' }}>✓ Verified</span>}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {inst.type && <span style={{ fontSize: '11px', fontWeight: '800', color: '#0083B0', background: '#E0F7FA', padding: '4px 10px', borderRadius: '100px' }}>{inst.type}</span>}
                {inst.affiliation && <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '4px 10px', borderRadius: '100px' }}>{inst.affiliation}</span>}
              </div>
              {inst.ratings?.totalReviews > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A' }}>{inst.ratings.overall?.toFixed(1)}</span>
                    <div>
                      <div style={{ display: 'flex' }}>
                        {[1,2,3,4,5].map(i => (<span key={i} style={{ fontSize: '14px', color: i <= Math.round(inst.ratings.overall) ? '#FBBF24' : '#D1D5DB' }}>★</span>))}
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>{inst.ratings.totalReviews} reviews</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0083B0' }}>View →</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>No reviews yet</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0083B0' }}>Be first →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddInstitutionModal open={showAddModal} onClose={() => setShowAddModal(false)} onSaved={() => fetchInstitutions()} />
    </div>
  );
}
