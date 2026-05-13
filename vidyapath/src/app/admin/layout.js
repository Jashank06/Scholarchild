'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import api from '@/lib/api';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

const navSections = [
  {
    label: 'Admin Panel',
    items: [
      { icon: '📊', label: 'Dashboard', href: '/admin' },
      { icon: '👥', label: 'Users', href: '/admin/users' },
      { icon: '🎓', label: 'Opportunities', href: '/admin/opportunities' },
      { icon: '🤖', label: 'AI Agent', href: '/admin/agent' },
      { icon: '🏫', label: 'Schools', href: '/admin/schools' },
      { icon: '🛠️', label: 'Support Tickets', href: '/admin/services' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: '📋', label: 'Applications', href: '/admin/applications' },
      { icon: '🔔', label: 'Notifications', href: '/admin/notifications' },
      { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
    ],
  },
];

export default function AdminLayout({ children }) {
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
        if (res.user && res.user.role === 'admin') {
          setUser(res.user);
        } else {
          router.push('/auth');
        }
      } catch (err) { router.push('/auth'); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [router]);

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><div className={styles.orb}></div></div>;

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
            <div className={styles.sLogoIcon}>🛡️</div>
            <div className={styles.sLogoText}>Vidya<span>Path</span></div>
          </div>

          {/* Admin Panel Badge */}
          <div className={styles.xpSection} style={{ background: 'rgba(15, 23, 42, 0.05)', borderColor: 'rgba(15, 23, 42, 0.1)' }}>
            <div className={styles.xpHeader}>
              <span className={styles.xpLevel} style={{ color: '#0F172A' }}>ADMIN PANEL</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', marginTop: '4px' }}>System Command Center</div>
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
            <input type="text" className={styles.searchInput} placeholder="Search users, opportunities..." />
          </div>
          <div className={styles.topbarRight}>
            <NotificationCenter />
            <div className={styles.userAvatar}>
              <div className={styles.avatarCircle}>
                {user?.profile?.avatar ? (
                  <img src={api.getImageUrl(user.profile.avatar)} alt="Admin" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                ) : '🛡️'}
              </div>
              <div>
                <div className={styles.userName}>{user?.profile?.firstName} {user?.profile?.lastName}</div>
                <div className={styles.userGrade}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
}
