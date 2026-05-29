'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const categoryEmoji = { school: '🏫', coaching: '📚', tuition: '✏️', 'test-prep': '📝', library: '📖', training: '🎯', consultancy: '💼', other: '🏪' };
const categoryColors = {
  school: '#EFF6FF', coaching: '#FFFBEB', tuition: '#ECFDF5',
  'test-prep': '#FEF2F2', library: '#F5F3FF', training: '#FDF2F8',
  consultancy: '#F0F9FF', other: '#F3F4F6',
};
const categoryTextColors = {
  school: '#2563EB', coaching: '#D97706', tuition: '#059669',
  'test-prep': '#DC2626', library: '#6D28D9', training: '#BE185D',
  consultancy: '#0284C7', other: '#6B7280',
};

export default function ParentServiceProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cities, setCities] = useState([]);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchData();
    api.getServiceProviderCities().then(r => setCities(r.data || [])).catch(() => {});
  }, [activeCategory, cityFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (cityFilter) params.city = cityFilter;
      const res = await api.getServiceProviders(params);
      setProviders(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleClick = async (item) => {
    try { await api.trackServiceProviderClick(item._id); } catch (e) {}
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  const allCategories = Object.keys(categoryEmoji);
  const featured = providers.filter(p => p.featured);
  const regular = providers.filter(p => !p.featured);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', margin: '0 0 4px' }}>
          🏪 Services for Your Child
        </h1>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
          Trusted schools, coaching centers, and educational services for your child
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCategory('All')}
          style={{ padding: '8px 18px', border: 'none', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', background: activeCategory === 'All' ? '#0B0B1A' : '#F3F4F6', color: activeCategory === 'All' ? 'white' : '#6B7280' }}>
          All
        </button>
        {allCategories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            style={{ padding: '8px 18px', border: 'none', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', background: activeCategory === c ? '#0B0B1A' : '#F3F4F6', color: activeCategory === c ? 'white' : '#6B7280' }}>
            {categoryEmoji[c]} {c}
          </button>
        ))}
      </div>

      {cities.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#374151', background: 'white' }}>
            <option value="">📍 All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading...</div>
      ) : providers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '24px', border: '2px dashed #E5E7EB' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontWeight: '600' }}>No service providers found.</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A', marginBottom: '16px' }}>✨ Featured Providers</h2>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                {featured.map(p => (
                  <div key={p._id} onClick={() => handleClick(p)}
                    style={{ background: 'white', borderRadius: '20px', border: '2px solid #FEF3C7', padding: '24px', cursor: p.link ? 'pointer' : 'default', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.1)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: categoryColors[p.category] || '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                        {categoryEmoji[p.category] || '🏪'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0B0B1A', margin: '0 0 4px' }}>{p.name}</h3>
                        {p.tagline && <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px' }}>{p.tagline}</p>}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: categoryColors[p.category] || '#F3F4F6', color: categoryTextColors[p.category] || '#6B7280' }}>{p.category}</span>
                          {p.city && <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: '#F3F4F6', color: '#6B7280' }}>📍 {p.city}</span>}
                        </div>
                      </div>
                    </div>
                    {p.description && <p style={{ fontSize: '13px', color: '#6B7280', margin: '12px 0', lineHeight: '1.5' }}>{p.description}</p>}
                    {p.servicesOffered?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {p.servicesOffered.slice(0, 4).map((s, i) => (
                          <span key={i} style={{ fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px', background: '#F3F4F6', color: '#6B7280' }}>{s}</span>
                        ))}
                        {p.servicesOffered.length > 4 && <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px', background: '#F3F4F6', color: '#6B7280' }}>+{p.servicesOffered.length - 4} more</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#9CA3AF' }}>
                      {p.contactPhone && <span>📞 {p.contactPhone}</span>}
                      {p.contactEmail && <span>✉️ {p.contactEmail}</span>}
                      {p.discountInfo && <span style={{ color: '#059669', fontWeight: '700' }}>🏷️ {p.discountInfo}</span>}
                    </div>
                    {p.link && <div style={{ marginTop: '14px' }}>
                      <span style={{ padding: '10px 24px', borderRadius: '100px', background: '#0B0B1A', color: 'white', fontWeight: '700', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {p.linkLabel || 'Visit Site'} →
                      </span>
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A', marginBottom: '16px' }}>All Providers</h2>
            <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {regular.map(p => (
                <div key={p._id} onClick={() => handleClick(p)}
                  style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', cursor: p.link ? 'pointer' : 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: categoryColors[p.category] || '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {categoryEmoji[p.category] || '🏪'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0B0B1A', margin: 0 }}>{p.name}</h3>
                      {p.city && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>📍 {p.city}</span>}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: categoryColors[p.category] || '#F3F4F6', color: categoryTextColors[p.category] || '#6B7280', flexShrink: 0 }}>{p.category}</span>
                  </div>
                  {p.description && <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px', lineHeight: '1.5' }}>{p.description}</p>}
                  {p.servicesOffered?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {p.servicesOffered.slice(0, 3).map((s, i) => (
                        <span key={i} style={{ fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px', background: '#F3F4F6', color: '#6B7280' }}>{s}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#9CA3AF' }}>
                      {p.contactPhone && <span>📞 {p.contactPhone}</span>}
                    </div>
                    {p.link && <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {p.linkLabel || 'Visit Site'} →
                    </span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
