'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MyChildrenPage() {
  const [children, setChildren] = useState([]);
  const [linkEmail, setLinkEmail] = useState('');
  const [relationship, setRelationship] = useState('guardian');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const me = await api.getMe();
      setChildren(me.user?.parentProfile?.children || []);
    } catch (e) { console.error(e); }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.linkChild(linkEmail, relationship);
      if (res.success) {
        setMessage({ text: `✅ ${res.message}`, type: 'success' });
        setLinkEmail('');
        loadChildren();
      } else {
        setMessage({ text: res.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to link child', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>My Children 👶</h1>
      <p style={{ color: '#6B7280', marginBottom: '40px' }}>Link and manage your children's accounts.</p>

      {/* Link Child Form */}
      <div style={{
        background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px',
        padding: '32px', marginBottom: '40px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Link a Child Account</h3>
        <form onSubmit={handleLink} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Child's Email
            </label>
            <input
              type="email" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="child@email.com" required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }}
            />
          </div>
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Relationship
            </label>
            <select value={relationship} onChange={(e) => setRelationship(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px' }}>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '12px 32px', background: '#2563EB', color: 'white',
            border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          }}>
            {loading ? 'Linking...' : 'Link Child →'}
          </button>
        </form>
        {message.text && (
          <div style={{
            marginTop: '16px', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
            background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: message.type === 'success' ? '#059669' : '#DC2626',
          }}>
            {message.text}
          </div>
        )}
      </div>

      {/* Children List */}
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
        Linked Children ({children.length})
      </h3>
      {children.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px',
          padding: '60px', textAlign: 'center', color: '#6B7280',
        }}>
          No children linked yet. Use the form above to link your child's student account.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {children.map((child, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px',
              padding: '28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  🧑‍🎓
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0B0B1A' }}>Child {i + 1}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'capitalize' }}>{child.relationship}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#2563EB' }}>
                Linked on {new Date(child.linkedAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
