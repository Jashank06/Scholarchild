import styles from './CareersHero.module.css';

export default function CareersHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">👋 We are Hiring</span>
          <h1 className={styles.title}>
            Help Us Build the <span className={styles.highlight}>Future</span> of Education.
          </h1>
          <p className={styles.subtitle}>
            Join a fast-growing team of visionaries dedicated to making opportunity 
            accessible to every student in India. Your work will impact millions.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.primaryBtn}>View Open Roles</button>
            <button className={styles.secondaryBtn}>Life at VidyaPath</button>
          </div>
        </div>
      </div>
      <div className={styles.backgroundBlobs}>
        <div className={styles.blobOne}></div>
        <div className={styles.blobTwo}></div>
      </div>
    </section>
  );
}
