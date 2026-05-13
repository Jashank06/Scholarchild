'use client';

import { useRouter } from 'next/navigation';
import styles from './ForSchools.module.css';

const schoolFeatures = [
  'Dedicated school counselor dashboard',
  'Recommend opportunities to students',
  'Track student participation & applications',
  'Aggregate analytics & performance reports',
  'Bulk student onboarding',
];

const orgFeatures = [
  'List your scholarships & competitions',
  'Reach 50,000+ verified student profiles',
  'Manage applications & submissions',
  'Analytics on reach & engagement',
  'Free listing for NGOs & govt bodies',
];

export default function ForSchools() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/auth');
  };

  return (
    <section className={styles.section} id="partners">
      <div className={styles.sectionHeader}>
        <span className="section-label">💎 Global Partnerships</span>
        <h2 className="section-title">
          For <span className={styles.partnerHighlight}>Schools & Organizations</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Join the elite network of institutions empowering the next generation.
        </p>
      </div>

      <div className={styles.partnersGrid}>
        {/* School Card */}
        <div className={styles.partnerCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardEmoji}>🏫</span>
            <div className={styles.cardHeaderText}>
              <h3>For Schools</h3>
              <p>Empower your students with opportunities</p>
            </div>
          </div>
          <p className={styles.cardDescription}>
            Give your students and counselors a powerful tool to discover 
            and track scholarships, competitions, and government schemes — 
            all from one dashboard.
          </p>
          <div className={styles.featureList}>
            {schoolFeatures.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <button className={`${styles.partnerCta} ${styles.ctaSchool}`} onClick={handleStart}>
            Register Your School →
          </button>
        </div>

        {/* Organization Card */}
        <div className={styles.partnerCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardEmoji}>🏢</span>
            <div className={styles.cardHeaderText}>
              <h3>For Organizations</h3>
              <p>NGOs, Corporates, Government bodies</p>
            </div>
          </div>
          <p className={styles.cardDescription}>
            List your scholarships, competitions, or welfare schemes 
            on Kushaagra and reach thousands of verified student profiles 
            across India — for free.
          </p>
          <div className={styles.featureList}>
            {orgFeatures.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <button className={`${styles.partnerCta} ${styles.ctaOrg}`} onClick={handleStart}>
            List Your Opportunity →
          </button>
        </div>
      </div>

      {/* Trusted By */}
      <div className={styles.trustedBy}>
        <div className={styles.trustedLabel}>Trusted by leading institutions</div>
        <div className={styles.trustedLogos}>
          <span className={styles.trustedLogo}>NCERT</span>
          <span className={styles.trustedLogo}>CBSE</span>
          <span className={styles.trustedLogo}>SOF</span>
          <span className={styles.trustedLogo}>INSPIRE</span>
          <span className={styles.trustedLogo}>NSP</span>
          <span className={styles.trustedLogo}>KVPY</span>
        </div>
      </div>
    </section>
  );
}
