'use client';

import { useRouter } from 'next/navigation';
import styles from './CTA.module.css';

export default function CTA() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/auth');
  };

  return (
    <section className={styles.section}>
      <div className={styles.ctaCard}>
        <div className={styles.ctaContent}>
          <span className={styles.ctaEmoji}>🚀</span>
          <h2 className={styles.ctaTitle}>
            Ready to Find Your<br />Next Opportunity?
          </h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of students across India who are already discovering 
            scholarships and competitions tailored just for them.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaBtnPrimary} onClick={handleStart}>
              Get Started for Free →
            </button>
            <button className={styles.ctaBtnSecondary} onClick={handleStart}>
              Explore Without Signup
            </button>
          </div>
          <p className={styles.ctaNote}>
            ✨ No credit card required • Free forever • Join 50,000+ students
          </p>
        </div>
      </div>
    </section>
  );
}
