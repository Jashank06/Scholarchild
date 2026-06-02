import styles from './FeaturesHero.module.css';

export default function FeaturesHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot}></span>
            <span>Live in production — 10,000+ opportunities indexed</span>
          </div>
          <h1 className={styles.title}>
            Everything You Need to <span className={styles.highlight}>Win</span> Your Next Opportunity.
          </h1>
          <p className={styles.subtitle}>
            No fluff. No gimmicks. Just real tools that work — from AI-powered matching 
            to deadline tracking, document vaults, and parent dashboards. Built for Indian students, 
            tested on real data, and completely free.
          </p>
          <div className={styles.proofPoints}>
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>10,000+</span>
              <span className={styles.proofLabel}>Opportunities</span>
            </div>
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>1.2M</span>
              <span className={styles.proofLabel}>Students Served</span>
            </div>
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>100%</span>
              <span className={styles.proofLabel}>Free Forever</span>
            </div>
          </div>
        </div>
        <div className={styles.visual}>
          <div className={styles.floatingUI}>
            <div className={styles.uiCard}>
              <img src="/images/features/hero-ai.png" alt="AI Neural Brain" className={styles.heroImg} />
            </div>
            <div className={styles.uiCardTwo}>
              <img src="/images/features/hero-docs.png" alt="Scholarship Docs" className={styles.heroImg} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
