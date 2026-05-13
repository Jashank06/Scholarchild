import styles from './PhilHero.module.css';

export default function PhilHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">🤝 Giving Back</span>
          <h1 className={styles.title}>
            Investing in India's <span className={styles.highlight}>Human</span> Capital.
          </h1>
          <p className={styles.subtitle}>
            Through the VidyaPath Foundation, we provide direct financial aid, 
            mentorship, and resources to underprivileged students who show 
            exceptional promise.
          </p>
        </div>
      </div>
    </section>
  );
}
