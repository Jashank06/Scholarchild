'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const categoryEmoji = { announcement: '📢', achievement: '🏅', news: '📰', event: '🎪', featured: '⭐', 'success-story': '🌟', other: '📌' };
const categoryGradients = {
  announcement: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  achievement: 'linear-gradient(135deg, #F59E0B, #D97706)',
  news: 'linear-gradient(135deg, #10B981, #047857)',
  event: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  featured: 'linear-gradient(135deg, #F97316, #EA580C)',
  'success-story': 'linear-gradient(135deg, #EC4899, #BE185D)',
  other: 'linear-gradient(135deg, #6B7280, #4B5563)',
};

export default function StudentNotablePage() {
  const [notables, setNotables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
    api.getNotableCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      const res = await api.getNotables(params);
      setNotables(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleClick = async (item) => {
    try { await api.trackNotableClick(item._id); } catch (e) {}
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  const featured = notables.filter(n => n.featured);
  const regular = notables.filter(n => !n.featured);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', margin: '0 0 4px' }}>
          ⭐ Notable
        </h1>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
          Announcements, achievements, and featured stories
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCategory('All')}
          style={{ padding: '8px 18px', border: 'none', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', background: activeCategory === 'All' ? '#0B0B1A' : '#F3F4F6', color: activeCategory === 'All' ? 'white' : '#6B7280', transition: 'all 0.2s' }}>
          All
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            style={{ padding: '8px 18px', border: 'none', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', background: activeCategory === c ? '#0B0B1A' : '#F3F4F6', color: activeCategory === c ? 'white' : '#6B7280', transition: 'all 0.2s' }}>
            {categoryEmoji[c] || '📌'} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading...</div>
      ) : notables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '24px', border: '2px dashed #E5E7EB' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ fontWeight: '600' }}>No notables yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A', marginBottom: '16px' }}>✨ Featured</h2>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
                {featured.map(n => (
                  <div key={n._id} onClick={() => handleClick(n)}
                    style={{ background: 'white', borderRadius: '20px', border: '2px solid #FEF3C7', padding: '28px', cursor: n.link ? 'pointer' : 'default', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '0 20px 0 120px', background: 'linear-gradient(135deg, transparent 50%, #FEF3C7 50%)' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 1 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '100px', background: '#FEF3C7', color: '#D97706', display: 'inline-block', marginBottom: '8px' }}>
                          {categoryEmoji[n.category]} {n.category}
                        </span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A', margin: '0 0 6px', lineHeight: '1.3' }}>{n.title}</h3>
                        {n.description && <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px', lineHeight: '1.5' }}>{n.description}</p>}
                        {n.source && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Source: {n.source}</span>}
                        {n.link && <div style={{ marginTop: '12px' }}>
                          <span style={{ padding: '8px 20px', borderRadius: '100px', background: '#0B0B1A', color: 'white', fontWeight: '700', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {n.linkLabel || 'Learn More'} →
                          </span>
                        </div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A', marginBottom: '16px' }}>All Notables</h2>
            <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {regular.map(n => (
                <div key={n._id} onClick={() => handleClick(n)}
                  style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', cursor: n.link ? 'pointer' : 'default', transition: 'all 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, background: '#F3F4F6' }}>
                      {categoryEmoji[n.category] || '📌'}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: '#F3F4F6', color: '#6B7280' }}>
                      {n.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B0B1A', margin: '0 0 6px', lineHeight: '1.3' }}>{n.title}</h3>
                  {n.description && <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px', lineHeight: '1.5' }}>{n.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {n.source && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>📰 {n.source}</span>}
                    {n.link && <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {n.linkLabel || 'Learn More'} →
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
