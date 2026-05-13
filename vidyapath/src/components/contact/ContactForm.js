import styles from './ContactForm.module.css';

export default function ContactForm() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.formContainer}>
            <div className={styles.glassCard}>
              <h2 className={styles.formTitle}>Send a Message</h2>
              <form className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Subject</label>
                  <select>
                    <option>General Inquiry</option>
                    <option>Scholarship Support</option>
                    <option>Partnership Request</option>
                    <option>Careers</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Message</label>
                  <textarea placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Deploy Message 🚀
                </button>
              </form>
            </div>
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.infoCard}>
              <div className={styles.iconVault}>📍</div>
              <div>
                <h3>Our Headquarters</h3>
                <p>Knowledge Park III, Greater Noida, UP, India</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.iconVault}>📧</div>
              <div>
                <h3>Email Support</h3>
                <p>support@kushaagra.com</p>
                <p>info@kushaagra.com</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.iconVault}>📱</div>
              <div>
                <h3>Social Hub</h3>
                <div className={styles.socialIcons}>
                  <span>in</span>
                  <span>𝕏</span>
                  <span>📷</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
