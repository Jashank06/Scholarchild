/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ParentResultsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ board: '', state: '', level: '', search: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.board) params.board = filters.board;
      if (filters.state) params.state = filters.state;
      if (filters.level) params.level = filters.level;
      if (filters.search) params.search = filters.search;
      const res = await api.getResultSources(params);
      setItems(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Results 🏆</h1>
      <p style={{ color: '#6B7280', marginBottom: '22px' }}>Official result portals for Class 10 and 12 (board-wise and state-wise).</p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search board, exam, or portal"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ minWidth: '240px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px' }}
        />
        <select value={filters.board} onChange={(e) => setFilters({ ...filters, board: e.target.value })}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">All Boards</option>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE</option>
          <option value="State">State</option>
          <option value="IB">IB</option>
          <option value="IGCSE">IGCSE</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="State (e.g. Haryana)"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          style={{ minWidth: '180px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px' }}
        />
        <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">All Levels</option>
          <option value="10">Class 10</option>
          <option value="12">Class 12</option>
          <option value="other">Other</option>
        </select>
        <button onClick={load} style={{ padding: '12px 22px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '999px', fontWeight: '800', cursor: 'pointer' }}>Apply</button>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>Loading result portals...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280', border: '1px dashed #E5E7EB', borderRadius: '18px' }}>
          No result portals found for the selected filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {items.map((item) => (
            <div key={item._id} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0B0B1A' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                  {item.board} {item.state ? `• ${item.state}` : ''} • Class {item.level}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>{item.examName}</div>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 16px', background: '#0F172A', color: 'white', borderRadius: '999px', fontWeight: '800', fontSize: '12px', textDecoration: 'none' }}
              >
                Open Portal
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
