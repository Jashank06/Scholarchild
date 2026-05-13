import styles from './CorePillars.module.css';

const pillars = [
  {
    title: 'Precision Intelligence',
    desc: 'Our AI doesn\'t just search; it understands your unique potential and maps it to the most relevant opportunities with 98% accuracy.',
    icon: '🎯',
    detail: 'Neural Match v4.0'
  },
  {
    title: 'Verified Security',
    desc: 'Every single listing undergoes a rigorous 3-step verification process to ensure zero scams and 100% official data integrity.',
    icon: '🛡️',
    detail: 'Zero-Knowledge Vault'
  },
  {
    title: 'Radical Accessibility',
    desc: 'Breaking geographical and language barriers to reach students in the remotest parts of India through our mobile-first ecosystem.',
    icon: '🌍',
    detail: 'Offline-Sync Mode'
  },
  {
    title: 'Direct Empowerment',
    desc: 'Bypassing middlemen to ensure rewards and scholarships reach the students\' bank accounts directly through automated disbursement links.',
    icon: '💸',
    detail: 'Direct Pay Integration'
  }
];

export default function CorePillars() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-label">⚙️ Operational Excellence</span>
          <h2 className="section-title">The Four <span className={styles.highlight}>Pillars</span> of Kushaagra</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            The technological and ethical foundation that makes us India's most trusted platform.
          </p>
        </div>

        <div className={styles.pillarGrid}>
          {pillars.map((pillar, i) => (
            <div key={i} className={styles.pillarCard}>
              <div className={styles.pillarHeader}>
                <div className={styles.iconVault}>{pillar.icon}</div>
                <div className={styles.detailBadge}>{pillar.detail}</div>
              </div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.desc}</p>
              <div className={styles.luminousBase}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
