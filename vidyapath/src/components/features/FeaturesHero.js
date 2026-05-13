import styles from './FeaturesHero.module.css';

export default function FeaturesHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">⚡ The Technology</span>
          <h1 className={styles.title}>
            The Most Advanced <span className={styles.highlight}>Scholarship</span> Engine Ever Built.
          </h1>
          <p className={styles.subtitle}>
            We've combined AI, real-time data streaming, and secure document vaulting 
            into a single, high-fidelity experience for students across India.
          </p>
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
