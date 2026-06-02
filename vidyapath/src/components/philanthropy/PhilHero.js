import styles from './PhilHero.module.css';

export default function PhilHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">🤝 Giving Back</span>
          <h1 className={styles.title}>
            Philanthropy
          </h1>
          <p className={styles.subtitle}>
            Building communities, sharing knowledge, and celebrating success stories together
          </p>
        </div>
      </div>
    </section>
  );
}
