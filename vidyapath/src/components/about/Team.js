import styles from './Team.module.css';

const team = [
  { name: 'Jay Kumar', role: 'Founder & CEO', bio: 'Visionary behind VidyaPath, passionate about education equity.', emoji: '👨‍💻' },
  { name: 'Priya Sharma', role: 'Head of Partnerships', bio: 'Connecting schools and NGOs to our elite ecosystem.', emoji: '🤝' },
  { name: 'Amit Singh', role: 'Chief Tech Architect', bio: 'Building the AI engines that power student success.', emoji: '⚙️' },
  { name: 'Sneha Patel', role: 'Community Lead', bio: 'Ensuring every student feels supported on their journey.', emoji: '🌍' },
];

export default function Team() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-label">🧠 The Minds</span>
          <h2 className="section-title">Meet the <span className={styles.highlight}>Architects</span> of Success</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            A team of educators, engineers, and visionaries working to change India's future.
          </p>
        </div>

        <div className={styles.grid}>
          {team.map((member, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.avatarVault}>
                  <span className={styles.emoji}>{member.emoji}</span>
                  <div className={styles.glowRing}></div>
                </div>
                <h3 className={styles.name}>{member.name}</h3>
                <p className={styles.role}>{member.role}</p>
                <p className={styles.bio}>{member.bio}</p>
                <div className={styles.socials}>
                  <span className={styles.socialIcon}>in</span>
                  <span className={styles.socialIcon}>𝕏</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
