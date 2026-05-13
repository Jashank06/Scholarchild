'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAdminStats();
        setStats(res.stats);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#2563EB' },
    { label: 'Students', value: stats?.totalStudents || 0, icon: '🧑‍🎓', color: '#059669' },
    { label: 'Scholarships', value: stats?.totalScholarships || 0, icon: '🎓', color: '#F59E0B' },
    { label: 'Competitions', value: stats?.totalCompetitions || 0, icon: '🏆', color: '#8B5CF6' },
    { label: 'Govt. Schemes', value: stats?.totalSchemes || 0, icon: '🏛️', color: '#EC4899' },
    { label: 'Applications', value: stats?.totalApplications || 0, icon: '📋', color: '#0EA5E9' },
    { label: 'Total Opportunities', value: stats?.totalOpportunities || 0, icon: '🌟', color: '#14B8A6' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Admin Dashboard 🛡️</h1>
        <p style={{ color: '#6B7280' }}>Platform overview and management tools.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '28px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0B0B1A', marginBottom: '20px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Manage Users', icon: '👥', href: '/admin/users' },
          { label: 'Manage Opportunities', icon: '🎓', href: '/admin/opportunities' },
          { label: 'Verify Schools', icon: '🏫', href: '/admin/schools' },
          { label: 'Send Notifications', icon: '🔔', href: '/admin/notifications' },
        ].map((action, i) => (
          <a key={i} href={action.href} style={{
            display: 'block', background: 'white', border: '1px solid #E5E7EB',
            borderRadius: '20px', padding: '24px', textDecoration: 'none', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{action.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0B0B1A' }}>{action.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
