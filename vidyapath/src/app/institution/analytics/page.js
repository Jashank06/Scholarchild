'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './analytics.module.css';
import gsap from 'gsap';
import api from '@/lib/api';

export default function InstitutionAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const animRun = useRef(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.request('/institution/analytics');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!loading && data && !animRun.current) {
      animRun.current = true;
      gsap.fromTo('.stat-card-anim', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
      gsap.fromTo('.chart-card-anim',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { stats, recentActivity } = data || { stats: {}, recentActivity: [] };

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Institutional Intelligence 🧠</h1>
        <p className={styles.subtitle}>Deep dive into student performance, scholarship success, and institutional growth metrics.</p>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total Students', value: stats.totalStudents || 0, icon: '🧑‍🎓', trend: '+12%', up: true },
          { label: 'Applications Sent', value: stats.totalApplications || 0, icon: '📋', trend: '+24%', up: true },
          { label: 'Scholarships Won', value: stats.successfulApplications || 0, icon: '🏆', trend: '+8%', up: true },
          { label: 'Total Aid Secured', value: `₹${(stats.totalAid || 0).toLocaleString()}`, icon: '💰', trend: '+18%', up: true },
        ].map((stat, i) => (
          <div key={i} className={`${styles.statCard} stat-card-anim`}>
            <span className={styles.statIcon}>{stat.icon}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
            <div className={`${styles.statTrend} ${stat.up ? styles.trendUp : styles.trendDown}`}>
              {stat.up ? '↑' : '↓'} {stat.trend} <span style={{color: '#9CA3AF', fontWeight: '500'}}>this month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsLayout}>
        {/* Main Growth Chart */}
        <div className={`${styles.chartCard} chart-card-anim`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Application Velocity</h3>
            <select style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px', fontWeight: '700' }}>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div style={{ height: '250px', position: 'relative' }}>
            <svg viewBox="0 0 1000 300" className={styles.svgChart}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                className={styles.areaPath}
                d="M0,250 Q150,180 300,220 T600,100 T1000,150 L1000,300 L0,300 Z" 
              />
              <path 
                className={styles.linePath}
                d="M0,250 Q150,180 300,220 T600,100 T1000,150" 
              />
              <circle cx="300" cy="220" r="6" fill="white" stroke="#2563EB" strokeWidth="3" />
              <circle cx="600" cy="100" r="6" fill="white" stroke="#2563EB" strokeWidth="3" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#9CA3AF', fontSize: '11px', fontWeight: '700' }}>
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
            </div>
          </div>
        </div>

        {/* Success Rate Donut */}
        <div className={`${styles.chartCard} chart-card-anim`}>
          <h3 className={styles.chartTitle} style={{ marginBottom: '24px' }}>Approval Success</h3>
          <div className={styles.donutWrap}>
            <svg viewBox="0 0 36 36" className={styles.circularChart}>
              <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={styles.circle} style={{ stroke: '#2563EB' }} strokeDasharray={`${stats.successRate || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" className={styles.percentage}>{stats.successRate || 0}%</text>
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0B0B1A' }}>{stats.successRate > 50 ? 'Excellent Performance' : 'Growth Potential'}</div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Based on your students' scholarship approval journey.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Success Table */}
      <div className={`${styles.tableCard} stat-card-anim`}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Recent Activity</h3>
          <button style={{ color: '#2563EB', fontWeight: '800', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
        </div>
        <table className={styles.recentTable}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Scholarship / Award</th>
              <th>Date</th>
              <th>Status</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No recent activity found.</td></tr>
            ) : (
              recentActivity.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700' }}>{row.name}</td>
                  <td>{row.award}</td>
                  <td style={{ color: '#6B7280' }}>{row.date}</td>
                  <td>
                    <span className={`${styles.statusPill} ${row.status === 'Selected' ? styles.statusSuccess : styles.statusPending}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: row.status === 'Selected' ? '#059669' : '#F59E0B' }}>{row.impact}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
