'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AddEventModal from '@/components/schools/AddEventModal';

export default function StudentEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', city: '', category: '', search: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const res = await api.getEvents(params);
      setEvents(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSearch = (e) => { e.preventDefault(); fetchEvents(); };

  const filtered = events.filter((ev) => {
    if (filters.city && !ev.venue?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    return true;
  });

  const statusColor = (s) => {
    if (s === 'upcoming') return '#059669';
    if (s === 'ongoing') return '#2563EB';
    if (s === 'completed') return '#6B7280';
    return '#DC2626';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Events Directory 🎪</h1>
          <p style={{ color: '#6B7280', marginBottom: '32px' }}>Browse sports, cultural events & competitions across India.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '12px 24px', background: '#F5576C', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          fontSize: '14px', whiteSpace: 'nowrap',
        }}>➕ Add Event</button>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search events..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={{ flex: '1', minWidth: '200px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }} />
        <input type="text" placeholder="State" value={filters.state} onChange={(e) => setFilters({...filters, state: e.target.value})}
          style={{ minWidth: '160px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }} />
        <input type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}
          style={{ minWidth: '160px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }} />
        <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}>
          <option value="">All Categories</option>
          <option value="Sports">Sports</option><option value="Cultural">Cultural</option><option value="Competition">Competition</option><option value="Workshop">Workshop</option><option value="Other">Other</option>
        </select>
        <button type="submit" style={{ padding: '12px 24px', background: '#F5576C', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading events...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px', padding: '60px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎪</div>
          <p>No events found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((ev) => (
            <div key={ev._id} onClick={() => router.push(`/dashboard/events/${ev._id}`)}
              style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '28px', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A' }}>{ev.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>📍 {ev.venue?.city}, {ev.venue?.state}</p>
                </div>
                {ev.status && <span style={{ fontSize: '10px', fontWeight: '800', color: statusColor(ev.status), background: ev.status === 'upcoming' ? '#ECFDF5' : ev.status === 'ongoing' ? '#EFF6FF' : '#F3F4F6', padding: '4px 10px', borderRadius: '100px', textTransform: 'capitalize' }}>{ev.status}</span>}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {ev.category && <span style={{ fontSize: '11px', fontWeight: '800', color: '#F5576C', background: '#FDF2F8', padding: '4px 10px', borderRadius: '100px' }}>{ev.category}</span>}
                {ev.eventDate && <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '4px 10px', borderRadius: '100px' }}>📅 {new Date(ev.eventDate).toLocaleDateString('en-IN')}</span>}
                {ev.fees > 0 ? <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '4px 10px', borderRadius: '100px' }}>₹{ev.fees}</span> : <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '100px' }}>Free</span>}
              </div>
              {ev.description && <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>}
              {ev.ratings?.totalReviews > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A' }}>{ev.ratings.overall?.toFixed(1)}</span>
                    <div>
                      <div style={{ display: 'flex' }}>
                        {[1,2,3,4,5].map(i => (<span key={i} style={{ fontSize: '14px', color: i <= Math.round(ev.ratings.overall) ? '#FBBF24' : '#D1D5DB' }}>★</span>))}
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>{ev.ratings.totalReviews} reviews</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#F5576C' }}>View →</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>No reviews yet</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#F5576C' }}>Be first →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddEventModal open={showAddModal} onClose={() => setShowAddModal(false)} onSaved={() => fetchEvents()} />
    </div>
  );
}
