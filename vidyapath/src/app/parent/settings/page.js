'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ParentSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Settings ⚙️</h1>
        <p style={{ color: '#6B7280' }}>Manage your account preferences and security.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Security Section */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>🔐 Security</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button style={{
              padding: '12px 20px', background: '#F3F4F6', border: 'none', borderRadius: '12px',
              color: '#374151', fontWeight: '700', cursor: 'pointer', textAlign: 'left'
            }}>Change Password</button>
            <button style={{
              padding: '12px 20px', background: '#F3F4F6', border: 'none', borderRadius: '12px',
              color: '#374151', fontWeight: '700', cursor: 'pointer', textAlign: 'left'
            }}>Enable Two-Factor Authentication</button>
          </div>
        </div>

        {/* Notifications Section */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>🔔 Email Preferences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>New Scholarship Alerts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>Child Activity Reports</span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ background: '#FFF5F5', border: '1px solid #FEE2E2', borderRadius: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#991B1B', marginBottom: '8px' }}>Danger Zone</h2>
          <p style={{ color: '#991B1B', fontSize: '14px', marginBottom: '20px', opacity: 0.8 }}>Once you delete your account, there is no going back. Please be certain.</p>
          <button style={{
            padding: '12px 20px', background: '#DC2626', border: 'none', borderRadius: '100px',
            color: 'white', fontWeight: '800', cursor: 'pointer'
          }}>Delete Account</button>
        </div>
      </div>
    </div>
  );
}
