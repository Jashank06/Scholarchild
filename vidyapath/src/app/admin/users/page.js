/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', search: '' });
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.role) params.role = filter.role;
      if (filter.search) params.search = filter.search;
      const res = await api.getAllUsers(params);
      setUsers(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApprove = async (userId, approved) => {
    try {
      await api.request(`/admin/users/${userId}/approve`, {
        method: 'PUT', body: JSON.stringify({ approved }),
      });
      setMessage(`User ${approved ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) { console.error(e); }
  };

  const handleExport = async () => {
    try {
      const params = { ...filter, page: 1, limit: 10000 };
      const res = await api.getAllUsers(params);
      const rows = (res.data || []).map((u) => ({
        Name: `${u.profile?.firstName || u.institutionProfile?.institutionName || ''} ${u.profile?.lastName || ''}`.trim(),
        Email: u.email,
        Phone: u.phone || '',
        Role: u.role,
        Verified: u.isVerified ? 'Yes' : 'No',
        Approved: u.isApproved !== false ? 'Yes' : 'No',
        Joined: new Date(u.createdAt).toLocaleDateString('en-IN'),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      XLSX.writeFile(workbook, 'users_export.xlsx');
    } catch (error) {
      console.error(error);
      setMessage('Failed to export users');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '32px' }}>User Management 👥</h1>

      {message && <div style={{ padding: '12px', background: '#ECFDF5', color: '#059669', borderRadius: '12px', fontWeight: '700', marginBottom: '20px' }}>{message}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search..." value={filter.search}
          onChange={(e) => setFilter({...filter, search: e.target.value})}
          style={{ flex: '1', maxWidth: '300px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', outline: 'none' }}
        />
        <select value={filter.role} onChange={(e) => setFilter({...filter, role: e.target.value})}
          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">All Roles</option>
          <option value="student">Student</option><option value="parent">Parent</option>
          <option value="school">School</option><option value="admin">Admin</option>
        </select>
        <button onClick={fetchUsers} style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>Search</button>
        <button onClick={handleExport} style={{
          padding: '12px 24px', background: '#0F172A', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>Download Excel</button>
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              {['User', 'Email', 'Mobile', 'Role', 'Verified', 'Approved', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700' }}>
                  {u.profile?.firstName || u.institutionProfile?.institutionName || '—'} {u.profile?.lastName || ''}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6B7280' }}>{u.email}</td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6B7280' }}>{u.phone || '—'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    background: u.role === 'admin' ? '#FEF2F2' : u.role === 'school' ? '#EFF6FF' : u.role === 'parent' ? '#F0FDF4' : '#F9FAFB',
                    color: u.role === 'admin' ? '#DC2626' : u.role === 'school' ? '#2563EB' : u.role === 'parent' ? '#059669' : '#6B7280',
                    textTransform: 'capitalize',
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px' }}>{u.isVerified ? '✅' : '❌'}</td>
                <td style={{ padding: '14px 20px', fontSize: '14px' }}>{u.isApproved !== false ? '✅' : '⏳'}</td>
                <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  {u.isApproved === false && (
                    <button onClick={() => handleApprove(u._id, true)} style={{
                      padding: '6px 14px', background: '#059669', color: 'white',
                      border: 'none', borderRadius: '100px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginRight: '6px',
                    }}>Approve</button>
                  )}
                  {u.isApproved !== false && u.role !== 'admin' && (
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No users found.</div>
        )}
      </div>
    </div>
  );
}
