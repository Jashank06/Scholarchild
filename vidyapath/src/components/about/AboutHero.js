import styles from './AboutHero.module.css';

export default function AboutHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">💎 Our Vision</span>
          <h1 className={styles.title}>
            Democratizing <span className={styles.highlight}>Success</span> for Every Indian Student.
          </h1>
          <p className={styles.subtitle}>
            We believe that financial constraints or lack of information should never stand 
            between a talented student and their dreams. VidyaPath is more than a platform—it's a mission.
          </p>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>10L+</span>
              <span className={styles.statLabel}>Students Reached</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>Partners</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>₹500Cr+</span>
              <span className={styles.statLabel}>Rewards Distributed</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.backgroundMesh}></div>
    </section>
  );
}
