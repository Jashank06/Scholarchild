'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Philanthropy', href: '/philanthropy' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, opacity: 0 });
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setSpotlightPos(prev => ({ ...prev, opacity: 0 }));
  };

  const handleNavigation = (href) => {
    setMobileOpen(false);
    router.push(href);
  };

  const handleAuth = () => {
    router.push('/auth');
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${!isHomePage ? styles.light : ''}`}>
      <div className={styles.navContent}>
        <div className={styles.spotlightWrapper} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          {/* Luminous Spotlight */}
          <div 
            className={styles.spotlight} 
            style={{ 
              left: `${spotlightPos.x}px`,
              opacity: spotlightPos.opacity 
            }} 
          />
          
          <a href="#" className={styles.logo} onClick={() => handleNavigation('/')}>
            <span className={styles.logoIcon}>🎓</span>
            <div className={styles.logoTextWrapper}>
              <div className={styles.logoText}>Kusha<span>agra</span></div>
            </div>
          </a>

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item.href}
                className={styles.navLink}
                onClick={() => handleNavigation(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.navActions}>
            <button className={styles.loginBtn} onClick={handleAuth}>Log In</button>
            <button className={styles.signupBtn} onClick={handleAuth}>Sign Up</button>
          </div>
        </div>

        <button
          className={`${styles.menuBtn} ${mobileOpen ? styles.open : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map((item) => (
            <button
              key={item.href}
              className={styles.mobileNavLink}
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </button>
          ))}
          <div className={styles.mobileActions}>
            <button className={styles.loginBtn} onClick={handleAuth}>Log In</button>
            <button className={styles.signupBtn} onClick={handleAuth}>Get Started Free</button>
          </div>
        </div>
      )}
    </header>
  );
}
