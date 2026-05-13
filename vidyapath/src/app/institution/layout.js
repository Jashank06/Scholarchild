'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import api from '@/lib/api';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

const navSections = [
  {
    label: 'Main',
    items: [
      { icon: '🏠', label: 'Dashboard', href: '/institution' },
      { icon: '👩‍🎓', label: 'Students', href: '/institution/students' },
      { icon: '🎓', label: 'Opportunities', href: '/institution/opportunities' },
    ],
  },
  {
    label: 'Management',
    items: [
      { icon: '🏫', label: 'School Profile', href: '/institution/profile' },
      { icon: '📊', label: 'Analytics', href: '/institution/analytics' },
      { icon: '⚙️', label: 'Settings', href: '/institution/settings' },
    ],
  },
];

export default function InstitutionLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.getMe();
        if (res.user && ['school', 'university', 'service_provider'].includes(res.user.role)) {
          setUser(res.user);
        } else if (res.user) {
          if (res.user.role === 'student') router.push('/dashboard');
          else if (res.user.role === 'parent') router.push('/parent');
          else router.push('/auth');
        } else {
          router.push('/auth');
        }
      } catch (err) { router.push('/auth'); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [router]);

  const isActive = (href) => {
    if (href === '/institution') return pathname === '/institution';
    return pathname.startsWith(href);
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><div className={styles.orb}></div></div>;

  const instName = user?.institutionProfile?.institutionName || user?.profile?.firstName || 'Institution';
  const verStatus = user?.institutionProfile?.verificationStatus || 'pending';

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.show : ''}`} 
        onClick={() => setMobileOpen(false)} 
      />

      {/* Floating Glass Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarInner}>
          {/* Logo Section */}
          <div className={styles.sidebarLogo}>
            <div className={styles.sLogoIcon}>🏢</div>
            <div className={styles.sLogoText}>Kusha<span>agra</span></div>
          </div>

          {/* Institution Status Badge */}
          <div className={styles.xpSection} style={{ background: 'rgba(5, 150, 105, 0.05)', borderColor: 'rgba(5, 150, 105, 0.1)' }}>
            <div className={styles.xpHeader}>
              <span className={styles.xpLevel} style={{ color: '#059669' }}>INSTITUTION HUB</span>
              <span style={{ 
                fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '100px',
                background: verStatus === 'approved' ? '#ECFDF5' : '#FFFBEB',
                color: verStatus === 'approved' ? '#059669' : '#D97706',
                textTransform: 'uppercase'
              }}>{verStatus}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', marginTop: '4px' }}>Academic Command Center</div>
          </div>

          {/* Navigation Links */}
          <nav className={styles.sidebarNav}>
            {navSections.map((section) => (
              <div key={section.label} className={styles.navSection}>
                <div className={styles.navSectionLabel}>{section.label}</div>
                {section.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      setMobileOpen(false);
                    }}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </a>
                ))}
              </div>
            ))}
          </nav>

          {/* Sidebar Action Footer */}
          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={() => api.logout()}>
              <span className={styles.logoutIcon}>🚪</span>
              <span className={styles.logoutLabel}>Logout</span>
            </button>
            <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '→' : '← Collapse Panel'}
            </button>
          </div>
        </div>
      </aside>

      <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.show : ''}`} onClick={() => setMobileOpen(false)} />

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(true)}>☰</button>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" className={styles.searchInput} placeholder="Search students, opportunities..." />
          </div>
          <div className={styles.topbarRight}>
            <NotificationCenter />
            <div className={styles.userAvatar} onClick={() => router.push('/institution/profile')}>
              <div className={styles.avatarCircle}>
                {user?.profile?.avatar ? (
                  <img src={api.getImageUrl(user.profile.avatar)} alt="Institution" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                ) : '🏫'}
              </div>
              <div>
                <div className={styles.userName}>{instName}</div>
                <div className={styles.userGrade}>{user?.institutionProfile?.board || ''} • {user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
}
