import styles from './AboutHero.module.css';

export default function AboutHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.foundationBadge}>
            <span className={styles.foundationIcon}>🏛️</span>
            <span>People centric initiative from</span>
            <a href="https://venshitafoundation.org" target="_blank" rel="noopener noreferrer" className={styles.foundationLink}>
              venshitafoundation.org
            </a>
          </div>
          <h1 className={styles.title}>
            <span className={styles.line1}>Where <span className={styles.highlight}>Potential</span> Meets</span>
            <span className={styles.line2}><span className={styles.highlightAlt}>Opportunity</span> — India&apos;s Future Starts Here.</span>
          </h1>
          <p className={styles.subtitle}>
            Every student in India carries a dream. But dreams need direction, not just desire. 
            Kushaagra brings every scholarship, olympiad, competition, and government scheme 
            from across the country into one intelligent platform — because when talent meets 
            opportunity, the impossible becomes possible.
          </p>
          <div className={styles.foundationRole}>
            <h3 className={styles.roleTitle}>About <a href="https://venshitafoundation.org" target="_blank" rel="noopener noreferrer" className={styles.roleLink}>Venshita Foundation</a></h3>
            <p className={styles.roleText}>
              <a href="https://venshitafoundation.org" target="_blank" rel="noopener noreferrer" className={styles.roleLink}>Venshita Foundation</a> is a people-centric nonprofit dedicated to bridging the opportunity gap for students across India. 
              Through Kushaagra, the foundation empowers millions of young minds by providing a unified platform for scholarships, 
              olympiads, competitions, and government schemes — ensuring that every student, regardless of their background, 
              has access to the resources they need to succeed.
            </p>
          </div>
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
