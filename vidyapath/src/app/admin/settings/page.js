'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleBackup = async () => {
    setMessage({ text: '⏳ Generating database backup...', type: 'info' });
    // This would be a real endpoint in a production app
    setTimeout(() => {
      setMessage({ text: '✅ Backup created successfully! (Simulated)', type: 'success' });
    }, 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Platform Settings ⚙️</h1>
        <p style={{ color: '#6B7280' }}>Configure global platform parameters and maintenance tools.</p>
      </div>

      {message.text && (
        <div style={{
          padding: '14px', borderRadius: '14px', marginBottom: '24px', fontWeight: '700', fontSize: '14px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
        }}>{message.text}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Maintenance */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '28px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Maintenance & Data</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={handleBackup} style={{
              padding: '14px', background: '#F3F4F6', border: 'none', borderRadius: '14px',
              color: '#374151', fontWeight: '700', cursor: 'pointer', textAlign: 'left'
            }}>📁 Generate DB Backup</button>
            <button style={{
              padding: '14px', background: '#F3F4F6', border: 'none', borderRadius: '14px',
              color: '#374151', fontWeight: '700', cursor: 'pointer', textAlign: 'left'
            }}>🔍 System Health Check</button>
            <button style={{
              padding: '14px', background: '#FEF2F2', border: 'none', borderRadius: '14px',
              color: '#DC2626', fontWeight: '700', cursor: 'pointer', textAlign: 'left'
            }}>🧹 Clear Temporary Logs</button>
          </div>
        </div>

        {/* Global Config */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '28px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Global Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Registration Mode</label>
              <select style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
                <option value="open">Open Registration</option>
                <option value="invite">Invite Only</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>XP Multiplier</label>
              <input type="number" defaultValue="1.0" step="0.1" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
            </div>
            <button style={{
              padding: '14px', background: '#2563EB', color: 'white',
              border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer'
            }}>Save Configuration</button>
          </div>
        </div>
      </div>
    </div>
  );
}
