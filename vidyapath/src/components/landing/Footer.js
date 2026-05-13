'use client';

import styles from './Footer.module.css';

const platformLinks = [
  'Scholarships',
  'Competitions',
  'Government Schemes',
  'Olympiads',
  'Science Fairs',
  'Art Competitions',
];

const companyLinks = [
  'About Us',
  'Careers',
  'Blog',
  'Press',
  'Partners',
  'Contact',
];

const supportLinks = [
  'Help Center',
  'FAQ',
  'Community',
  'Feedback',
  'Report a Bug',
  'Status',
];

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.footerContent}>
        {/* Newsletter */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterText}>
            <h3>📬 Never Miss an Opportunity</h3>
            <p>Get weekly updates on new scholarships and competitions matching your profile.</p>
          </div>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              className={styles.newsletterInput}
              placeholder="Enter your email address"
              aria-label="Email for newsletter"
            />
            <button type="submit" className={styles.newsletterBtn}>
              Subscribe
            </button>
          </form>
        </div>

        {/* Footer Grid */}
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>🎓</div>
              <div className={styles.logoText}>
                Vidya<span>Path</span>
              </div>
            </div>
            <p className={styles.brandDescription}>
              India&apos;s #1 platform for students to discover, apply, and track 
              scholarships, competitions, and government schemes. Free forever.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Twitter">𝕏</a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">in</a>
              <a href="#" className={styles.socialLink} aria-label="YouTube">▶</a>
            </div>
          </div>

          {/* Platform Links */}
          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>Platform</div>
            {platformLinks.map((link) => (
              <a key={link} href="#" className={styles.footerLink}>{link}</a>
            ))}
          </div>

          {/* Company Links */}
          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>Company</div>
            {companyLinks.map((link) => (
              <a key={link} href="#" className={styles.footerLink}>{link}</a>
            ))}
          </div>

          {/* Support Links */}
          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>Support</div>
            {supportLinks.map((link) => (
              <a key={link} href="#" className={styles.footerLink}>{link}</a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © 2026 VidyaPath. All rights reserved.
          </div>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Privacy Policy</a>
            <a href="#" className={styles.bottomLink}>Terms of Service</a>
            <a href="#" className={styles.bottomLink}>Cookie Policy</a>
          </div>
          <div className={styles.madeWith}>
            Made with <span>❤️</span> in India 🇮🇳
          </div>
        </div>
      </div>
    </footer>
  );
}
