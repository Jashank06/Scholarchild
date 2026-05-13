'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import api from '@/lib/api';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

const navSections = [
  {
    label: 'Main',
    items: [
      { icon: '🏠', label: 'Dashboard', href: '/dashboard', badge: null },
      { icon: '🎓', label: 'Scholarships', href: '/dashboard/scholarships', badge: null },
      { icon: '🏆', label: 'Competitions', href: '/dashboard/competitions', badge: null },
      { icon: '🏛️', label: 'Govt. Schemes', href: '/dashboard/schemes', badge: null },
    ],
  },
  {
    label: 'My Activity',
    items: [
      { icon: '📋', label: 'Applications', href: '/dashboard/applications', badge: null },
      { icon: '🔖', label: 'Bookmarks', href: '/dashboard/bookmarks', badge: null },
      { icon: '🛠️', label: 'Support Center', href: '/dashboard/services', badge: null },
      { icon: '📅', label: 'Calendar', href: '/dashboard/calendar', badge: null },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: '👤', label: 'My Profile', href: '/dashboard/profile', badge: null },
      { icon: '📁', label: 'Documents', href: '/dashboard/documents', badge: null },
      { icon: '⚙️', label: 'Settings', href: '/dashboard/settings', badge: null },
    ],
  },
];

export default function DashboardLayout({ children }) {
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
        if (res.user) {
          // Role-based redirect
          if (res.user.role === 'parent') { router.push('/parent'); return; }
          if (res.user.role === 'school' || res.user.role === 'university') { router.push('/institution'); return; }
          if (res.user.role === 'admin') { router.push('/admin'); return; }
          setUser(res.user);
        } else {
          router.push('/auth');
        }
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><div className={styles.orb}></div></div>;

  const xp = user?.gamification?.xp || 0;
  const level = user?.gamification?.level || 1;
  const nextLevelXp = level * 1000; // Mock calculation
  const xpPercent = Math.min((xp / nextLevelXp) * 100, 100);

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
            <div className={styles.sLogoIcon}>🚀</div>
            <div className={styles.sLogoText}>Vidya<span>Path</span></div>
          </div>

          {/* Gamified XP Section */}
          <div className={styles.xpSection}>
            <div className={styles.xpHeader}>
              <span className={styles.xpLevel}>LEVEL {level}</span>
              <span className={styles.xpAmount}>{xp} XP</span>
            </div>
            <div className={styles.xpBar}>
              <div className={styles.xpFill} style={{ width: `${xpPercent}%` }}>
                <div className={styles.xpGlow}></div>
              </div>
            </div>
            <div className={styles.xpLabel}>Next: {nextLevelXp} XP</div>
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
                    <div className={styles.navIndicator}></div>
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

      {/* Mobile Overlay */}
      <div
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.show : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(true)}>
            ☰
          </button>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search scholarships, competitions, schemes..."
            />
            <span className={styles.searchShortcut}>⌘K</span>
          </div>

          <div className={styles.topbarRight}>
            <NotificationCenter />

            <div className={styles.userAvatar} onClick={() => router.push('/dashboard/profile')}>
              <div className={styles.avatarCircle}>{user?.profile?.avatar ? <img src={api.getImageUrl(user.profile.avatar)} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : '🧑‍🎓'}</div>
              <div>
                <div className={styles.userName}>{user?.profile?.firstName} {user?.profile?.lastName}</div>
                <div className={styles.userGrade}>{user?.profile?.grade ? `Grade ${user.profile.grade}` : user?.role} • {user?.profile?.address?.city || 'India'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
