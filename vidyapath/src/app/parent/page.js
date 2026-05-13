'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from '../dashboard/home.module.css';
import gsap from 'gsap';

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [childrenApps, setChildrenApps] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, recRes, appsRes] = await Promise.all([
          api.getMe(),
          api.getRecommendations(6),
          api.getParentApplications()
        ]);
        
        setUser(meRes.user);
        setRecommendations(recRes.data || []);
        setChildrenApps(appsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const q = gsap.utils.selector(containerRef.current);
      
      const welcome = q(`.${styles.welcomeCard}`);
      const stats = q(`.${styles.statWidget}`);
      const categories = q(`.${styles.categoryCard}`);
      const sections = q(`.${styles.sectionCard}`);

      if (welcome.length) {
        gsap.fromTo(welcome, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      }
      
      if (stats.length) {
        gsap.fromTo(stats, { scale: 0.9, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'back.out(1.5)' });
      }

      if (categories.length) {
        gsap.fromTo(categories, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.5, ease: 'power2.out' });
      }
    }
  }, [loading]);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #F3F4F6', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalAppsCount = childrenApps.reduce((acc, child) => acc + (child.applications?.length || 0), 0);

  return (
    <div className={styles.dashboardHome} ref={containerRef} style={{ padding: '0 20px' }}>
      {/* Refined Hero Banner */}
      <div className={styles.welcomeCard} style={{ background: '#0B0B1A', borderRadius: '28px', minHeight: 'auto', marginBottom: '24px' }}>
        <img src="/Users/Jay/.gemini/antigravity/brain/0468840e-b69f-4048-83af-9987c673575c/dashboard_hero_banner_1778703353205.png" alt="Banner" className={styles.welcomeImage} style={{ opacity: 0.3 }} />
        <div className={styles.welcomeOverlay} style={{ background: 'linear-gradient(90deg, #0B0B1A 40%, rgba(11, 11, 26, 0.2) 100%)' }}></div>
        
        <div className={styles.welcomeContent} style={{ padding: '40px' }}>
          <div className={styles.welcomeText}>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Secure Their Future 🛡️</h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px' }}>
              Welcome back, {user?.profile?.firstName}! supervising {childrenApps.length} students.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px 20px', borderRadius: '20px', textAlign: 'center', minWidth: '110px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{childrenApps.length}</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Children</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px 20px', borderRadius: '20px', textAlign: 'center', minWidth: '110px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{totalAppsCount}</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Applications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Compact Stats Row (HORIZONTAL CARDS) */}
      <div className={styles.statsRow} style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Apps', value: totalAppsCount, icon: '📋', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', shadow: 'rgba(79, 70, 229, 0.2)' },
          { label: 'Saved Items', value: user?.parentProfile?.bookmarks?.length || 0, icon: '🔖', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', shadow: 'rgba(217, 119, 6, 0.2)' },
          { label: 'Safety Alerts', value: 'Active', icon: '🔔', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', shadow: 'rgba(220, 38, 38, 0.2)' },
          { label: 'Badges Won', value: user?.gamification?.badges?.length || 0, icon: '🏅', gradient: 'linear-gradient(135deg, #10B981, #059669)', shadow: 'rgba(5, 150, 105, 0.2)' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={styles.statWidget} 
            style={{ 
              background: stat.gradient, border: 'none', padding: '16px 20px', borderRadius: '24px',
              display: 'flex', alignItems: 'center', gap: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              boxShadow: `0 10px 20px -5px ${stat.shadow}`, minHeight: 'auto'
            }}
          >
            <div style={{ width: '44px', height: '44px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Explore Resources (Compact Row) */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '1px' }}>Explore Resources</h2>
        <div className={styles.categoryGrid} style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { label: 'Scholarships', icon: '🎓', class: 'catScholarships', href: '/parent/scholarships' },
            { label: 'Competitions', icon: '🏆', class: 'catCompetitions', href: '/parent/scholarships' },
            { label: 'Schemes', icon: '🏛️', class: 'catSchemes', href: '/parent/schemes' },
            { label: 'Schools', icon: '🏫', class: 'catAcademic', href: '/parent/schools' },
            { label: 'Results', icon: '🏆', class: 'catCoding', href: '/parent/results' },
          ].map((cat, i) => (
            <div key={i} className={`${styles.categoryCard} ${styles[cat.class]}`} onClick={() => router.push(cat.href)} style={{ padding: '16px', borderRadius: '20px', aspect_ratio: 'auto' }}>
              <div className={styles.catIcon} style={{ width: '44px', height: '44px', fontSize: '20px', marginBottom: '8px' }}>{cat.icon}</div>
              <div className={styles.catLabel} style={{ fontSize: '13px' }}>{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Children (Tightened) */}
      <div className={styles.sectionCard} style={{ marginBottom: '40px', borderRadius: '28px', padding: '24px' }}>
        <div className={styles.sectionHeader} style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>🧑‍🎓 Linked Children</h2>
          <button className={styles.viewAllBtn} style={{ fontSize: '12px' }} onClick={() => router.push('/parent/children')}>Manage →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {childrenApps.map((child, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedChild(selectedChild === child.childId ? null : child.childId)}
              style={{
                padding: '20px', borderRadius: '24px', border: selectedChild === child.childId ? '2px solid #6366F1' : '1px solid #F1F5F9',
                background: selectedChild === child.childId ? '#F5F3FF' : 'white', cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🧑‍🎓</div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '15px', color: '#0F172A' }}>{child.name}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Grade {child.grade}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{child.applications?.length || 0} Apps</span>
                <span style={{ fontSize: '10px', color: '#6366F1', fontWeight: '900' }}>{selectedChild === child.childId ? 'Hide' : 'View'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
