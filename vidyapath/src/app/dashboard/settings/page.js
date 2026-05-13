'use client';

import { useState } from 'react';

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' },
  h1: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' },
  sub: { fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '4px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-5)' },
  card: { padding: 'var(--space-6)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)' },
  cardTitle: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' },
  settingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--glass-border)' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-primary)' },
  settingSub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', padding: '2px', cursor: 'pointer', transition: 'all 0.2s', border: 'none', position: 'relative' },
  toggleDot: { width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.2s', position: 'absolute', top: '2px' },
  select: { padding: 'var(--space-2) var(--space-4)', background: 'var(--surface-800)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none' },
  dangerBtn: { padding: 'var(--space-3) var(--space-6)', background: 'var(--error-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--error)', cursor: 'pointer', marginTop: 'var(--space-4)' },
  saveBtn: { padding: 'var(--space-3) var(--space-8)', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-glow-primary)', marginTop: 'var(--space-6)', alignSelf: 'flex-start' },
};

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: true, whatsapp: false });

  const Toggle = ({ on, onChange }) => (
    <button style={{ ...s.toggle, background: on ? 'var(--primary-500)' : 'var(--surface-600)' }} onClick={onChange}>
      <span style={{ ...s.toggleDot, left: on ? '22px' : '2px' }}></span>
    </button>
  );

  return (
    <div style={s.page}>
      <div><h1 style={s.h1}>⚙️ Settings</h1><p style={s.sub}>Manage your account preferences and notifications</p></div>

      <div style={s.grid}>
        {/* Notifications */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>🔔 Notifications</h3>
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'sms', label: 'SMS Notifications', desc: 'Get SMS alerts for deadlines' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'whatsapp', label: 'WhatsApp Alerts', desc: 'Deadline reminders on WhatsApp' },
          ].map(item => (
            <div key={item.key} style={s.settingRow}>
              <div style={s.settingInfo}>
                <div style={s.settingLabel}>{item.label}</div>
                <div style={s.settingSub}>{item.desc}</div>
              </div>
              <Toggle on={notifications[item.key]} onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>🌐 Preferences</h3>
          {[
            { label: 'Language', desc: 'Display language', options: ['English', 'हिंदी', 'मराठी', 'தமிழ்', 'తెలుగు'] },
            { label: 'Theme', desc: 'Color theme', options: ['Dark', 'Light', 'Auto'] },
            { label: 'Opportunity Types', desc: 'What to show', options: ['All', 'Scholarships Only', 'Competitions Only', 'Schemes Only'] },
          ].map(item => (
            <div key={item.label} style={s.settingRow}>
              <div style={s.settingInfo}>
                <div style={s.settingLabel}>{item.label}</div>
                <div style={s.settingSub}>{item.desc}</div>
              </div>
              <select style={s.select}>
                {item.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>🔒 Privacy & Security</h3>
          {[
            { label: 'Profile Visibility', desc: 'Show profile on leaderboard', on: true },
            { label: 'Data Sharing', desc: 'Share data with partner organizations', on: false },
            { label: 'Two-Factor Auth', desc: 'Extra security for your account', on: true },
          ].map(item => (
            <div key={item.label} style={s.settingRow}>
              <div style={s.settingInfo}>
                <div style={s.settingLabel}>{item.label}</div>
                <div style={s.settingSub}>{item.desc}</div>
              </div>
              <Toggle on={item.on} onChange={() => {}} />
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div style={{ ...s.card, borderColor: 'rgba(239,68,68,0.2)' }}>
          <h3 style={{ ...s.cardTitle, color: 'var(--error)' }}>⚠️ Danger Zone</h3>
          <div style={s.settingInfo}>
            <div style={s.settingLabel}>Delete Account</div>
            <div style={s.settingSub}>Permanently delete your account and all data. This action cannot be undone.</div>
          </div>
          <button style={s.dangerBtn}>Delete My Account</button>
        </div>
      </div>

      <button style={s.saveBtn}>💾 Save Settings</button>
    </div>
  );
}
