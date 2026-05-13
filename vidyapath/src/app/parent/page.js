'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import styles from '../dashboard/home.module.css';
import gsap from 'gsap';

export default function ParentDashboard() {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setUser(me.user);
        const childList = me.user?.parentProfile?.children || [];
        setChildren(childList);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const q = gsap.utils.selector(containerRef.current);
      gsap.from(q(`.${styles.welcomeCard}`), { y: 30, opacity: 0, duration: 1, ease: 'power4.out' });
      gsap.from(q(`.${styles.statWidget}`), { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
      gsap.from(q(`.${styles.sectionCard}`), { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, delay: 0.6, ease: 'power3.out' });
    }
  }, [loading]);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className={styles.dashboardHome} ref={containerRef}>
      {/* Hero Section */}
      <div className={styles.welcomeCard} style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <h1>Welcome, {user?.profile?.firstName}! 🛡️</h1>
            <p>You are managing {children.length} child profiles. Your family’s educational future starts here.</p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{children.length}</span>
              <span className={styles.welcomeStatLabel}>Children</span>
            </div>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{user?.parentProfile?.reviews?.length || 0}</span>
              <span className={styles.welcomeStatLabel}>Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Applications', value: 0, icon: '📋', type: 'purple' },
          { label: 'Saved Schemes', value: 0, icon: '🔖', type: 'amber' },
          { label: 'Active Alerts', value: 'Live', icon: '🔔', type: 'teal' },
          { label: 'Badges Earned', value: 0, icon: '🏅', type: 'rose' },
        ].map((stat, i) => (
          <div key={i} className={styles.statWidget}>
            <div className={`${styles.statWidgetIcon} ${styles[stat.type]}`}>{stat.icon}</div>
            <div>
              <div className={styles.statWidgetNum}>{stat.value}</div>
              <div className={styles.statWidgetLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Quick Access */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
          </div>
          <div className={styles.recoList}>
            {[
              { label: 'Browse Schools', icon: '🏫', href: '/parent/schools', desc: 'Find top institutions' },
              { label: 'Scholarships', icon: '🎓', href: '/parent/scholarships', desc: 'Find funding' },
              { label: 'Govt. Schemes', icon: '🏛️', href: '/parent/schemes', desc: 'State programs' },
              { label: 'Profile & Children', icon: '👤', href: '/parent/profile', desc: 'Manage children profiles' },
            ].map((action, i) => (
              <div key={i} className={styles.recoCard} onClick={() => window.location.href=action.href} style={{ cursor: 'pointer' }}>
                <div className={styles.recoIcon} style={{ background: '#F8FAFC', color: '#0F172A' }}>{action.icon}</div>
                <div className={styles.recoInfo}>
                  <div className={styles.recoTitle}>{action.label}</div>
                  <div className={styles.recoMeta}>{action.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
