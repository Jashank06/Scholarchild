'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function StudentHistoryPage() {
  const [history, setHistory] = useState({ news: [], achievements: [], feedback: [], reviews: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getStudentHistory();
        setHistory(res.data || { news: [], achievements: [], feedback: [], reviews: [] });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sections = [
    {
      title: 'News',
      icon: '📰',
      items: history.news.map((item) => `${item.title} (${new Date(item.publishedAt).toLocaleDateString()})`),
    },
    {
      title: 'Achievements',
      icon: '🏅',
      items: history.achievements.map((item) => item.title),
    },
    {
      title: 'Feedback',
      icon: '💬',
      items: history.feedback.map((item) => `${item.subject}: ${item.description}`),
    },
    {
      title: 'Reviews',
      icon: '⭐',
      items: history.reviews.map((item) => `Reviewed ${item.schoolId?.name || 'School'} (${item.ratings?.overall || 0}★)`),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>History 📰</h1>
      <p style={{ color: '#6B7280', marginBottom: '28px' }}>Your news, achievements, feedback, and reviews.</p>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>Loading history...</div>
      ) : (
        <div style={{ display: 'grid', gap: '18px' }}>
          {sections.map((section) => (
            <div key={section.title} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '22px', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>{section.icon}</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0B0B1A' }}>{section.title}</div>
              </div>
              {section.items.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: '13px' }}>No updates yet.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#6B7280', fontSize: '13px', display: 'grid', gap: '6px' }}>
                  {section.items.map((item, idx) => (
                    <li key={`${section.title}-${idx}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}