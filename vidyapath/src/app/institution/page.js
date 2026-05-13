'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import styles from '../dashboard/home.module.css';
import gsap from 'gsap';

export default function InstitutionDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setUser(me.user);
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
      <div style={{ width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const inst = user?.institutionProfile || {};
  const verStatus = inst.verificationStatus || 'pending';

  return (
    <div className={styles.dashboardHome} ref={containerRef}>
      {/* Hero Section */}
      <div className={styles.welcomeCard} style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <h1>Welcome, {inst.institutionName || 'Institution'}! 🏫</h1>
            <p>Your academic command center. Manage students, track applications, and post opportunities.</p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{inst.managedStudents?.length || 0}</span>
              <span className={styles.welcomeStatLabel}>Students</span>
            </div>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum} style={{ fontSize: '18px' }}>{verStatus.toUpperCase()}</span>
              <span className={styles.welcomeStatLabel}>Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Alert (Glassmorphic) */}
      {verStatus !== 'approved' && (
        <div className={styles.sectionCard} style={{ 
          marginBottom: '40px', background: 'rgba(255, 251, 235, 0.5)', 
          borderColor: 'rgba(245, 158, 11, 0.2)', padding: '24px 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '32px' }}>⏳</div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#92400E', marginBottom: '4px' }}>Verification in Progress</h3>
              <p style={{ fontSize: '14px', color: '#B45309', fontWeight: '600' }}>
                Your institution is being reviewed by the Kushaagra board. Some features like public scholarship posting will be live after approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className={styles.statsRow}>
        {[
          { label: 'Enrolled Students', value: inst.managedStudents?.length || 0, icon: '👩‍🎓', type: 'purple' },
          { label: 'Active Schemes', value: 0, icon: '🎓', type: 'amber' },
          { label: 'Board / Affiliation', value: inst.board || '—', icon: '📚', type: 'teal' },
          { label: 'Account Type', value: user?.role, icon: '🏛️', type: 'rose' },
        ].map((stat, i) => (
          <div key={i} className={styles.statWidget}>
            <div className={`${styles.statWidgetIcon} ${styles[stat.type]}`}>{stat.icon}</div>
            <div>
              <div className={styles.statWidgetNum} style={{ fontSize: '20px', textTransform: 'capitalize' }}>{stat.value}</div>
              <div className={styles.statWidgetLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Recent Activity / Students */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>👨‍🎓 Recent Students</h2>
            <button className={styles.viewAllBtn} onClick={() => window.location.href='/institution/students'}>View All →</button>
          </div>
          <div className={styles.recoList}>
            {inst.managedStudents?.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                No students enrolled yet.
              </div>
            ) : inst.managedStudents.slice(0, 4).map((s, i) => (
              <div key={i} className={styles.recoCard}>
                <div className={styles.recoIcon} style={{ background: '#ECFDF5', color: '#059669' }}>🧑‍🎓</div>
                <div className={styles.recoInfo}>
                  <div className={styles.recoTitle}>Student ID: {s.studentId?.slice(-6) || i+1}</div>
                  <div className={styles.recoMeta}>Grade: {s.grade} • Joined {new Date(s.enrolledAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⚡ Management Tools</h2>
          </div>
          <div className={styles.recoList}>
            {[
              { label: 'Manage Students', icon: '👩‍🎓', href: '/institution/students', desc: 'Verify and enroll' },
              { label: 'Post Scholarship', icon: '🎓', href: '/institution/opportunities', desc: 'Create new funding' },
              { label: 'Institution Profile', icon: '🏫', href: '/institution/profile', desc: 'Update details' },
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
