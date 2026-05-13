import styles from './ContactHero.module.css';

export default function ContactHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">📞 Get in Touch</span>
          <h1 className={styles.title}>
            Let's Start a <span className={styles.highlight}>Conversation</span>.
          </h1>
          <p className={styles.subtitle}>
            Have a question about a scholarship? Want to partner with us? 
            Or just want to say hi? Our team is ready to help you navigate your path.
          </p>
        </div>
      </div>
    </section>
  );
}
