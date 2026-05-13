import styles from './BlogHero.module.css';

export default function BlogHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">📢 Kushaagra Insights</span>
          <h1 className={styles.title}>
            Knowledge is the <span className={styles.highlight}>Greatest</span> Opportunity.
          </h1>
          <p className={styles.subtitle}>
            Explore the latest trends in education, tips for scholarship success, 
            and inspiring stories from the Kushaagra community.
          </p>
        </div>

        <div className={styles.featuredCard}>
          <div className={styles.featuredBadge}>FEATURED</div>
          <div className={styles.featuredContent}>
            <span className={styles.category}>STRATEGY</span>
            <h2>How to Secure a 100% Scholarship for your Higher Education</h2>
            <p>A step-by-step guide to building a profile that stands out to top scholarship committees globally.</p>
            <div className={styles.meta}>
              <span>By Jay Kumar</span>
              <span>• 8 min read</span>
            </div>
            <button className={styles.readBtn}>Read Article →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
