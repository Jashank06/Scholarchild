import styles from './FeatureShowcase.module.css';

const features = [
  {
    title: 'AI Smart Match v2.0',
    desc: 'Our proprietary algorithm analyzes 50+ data points from your profile to find scholarships with the highest win probability.',
    icon: '🤖',
    tags: ['98% Accuracy', 'Real-time', 'Auto-Sync'],
    img: '/images/features/match.png'
  },
  {
    title: 'Biometric Document Vault',
    desc: 'Securely store and auto-fill your documents across multiple applications with enterprise-grade AES-256 encryption.',
    icon: '🛡️',
    tags: ['Zero-Knowledge', 'Encrypted', 'Instant Fill'],
    img: '/images/features/vault.png'
  },
  {
    title: 'Global Scholar Quest',
    desc: 'Gamified discovery engine that rewards you with points and certifications as you complete your profile and apply.',
    icon: '🎮',
    tags: ['Rewards', 'Certificates', 'Badges'],
    img: '/images/features/quest.png'
  },
  {
    title: 'Institutional Linkage',
    desc: 'Direct connection with schools and government bodies for seamless verification and faster disbursements.',
    icon: '🏛️',
    tags: ['NSP Sync', 'Direct Pay', 'Schools'],
    img: '/images/features/network.png'
  }
];

export default function FeatureShowcase() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureBlock}>
              <div className={styles.content}>
                <div className={styles.iconVault}>{f.icon}</div>
                <h3 className={styles.fTitle}>{f.title}</h3>
                <p className={styles.fDesc}>{f.desc}</p>
                <div className={styles.tagCloud}>
                  {f.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
              <div className={styles.visualContainer}>
                <div className={styles.glassGraphic}>
                  <img src={f.img} alt={f.title} className={styles.featureImg} />
                  <div className={styles.innerGlow}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
