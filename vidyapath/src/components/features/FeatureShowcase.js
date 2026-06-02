import styles from './FeatureShowcase.module.css';

const features = [
  {
    title: 'AI Smart Match v2.0',
    desc: 'Our proprietary algorithm analyzes 50+ data points from your profile to find scholarships with the highest win probability.',
    icon: '🤖',
    tags: ['98% Accuracy', 'Real-time', 'Auto-Sync'],
    stat: '2.4x higher win rate',
    img: '/images/features/match.png'
  },
  {
    title: 'Biometric Document Vault',
    desc: 'Securely store and auto-fill your documents across multiple applications with enterprise-grade AES-256 encryption.',
    icon: '🛡️',
    tags: ['Zero-Knowledge', 'Encrypted', 'Instant Fill'],
    stat: 'Saved 45 mins per application',
    img: '/images/features/vault.png'
  },
  {
    title: 'Deadline Radar',
    desc: 'Never miss an opportunity again. Get smart notifications 7, 14, and 30 days before every deadline — with countdown widgets and calendar sync.',
    icon: '⏰',
    tags: ['Smart Alerts', 'Calendar Sync', 'Countdown'],
    stat: 'Zero missed deadlines',
    img: '/images/features/match.png'
  },
  {
    title: 'Parent Connect Hub',
    desc: 'Parents can create their own dashboard to monitor applications, track deadlines, download certificate proofs, and guide their child every step of the way.',
    icon: '👨‍👩‍👧',
    tags: ['Real-time Sync', 'Reports', 'Guidance'],
    stat: 'Used by 50K+ parents',
    img: '/images/features/network.png'
  },
  {
    title: 'Multi-Lingual Interface',
    desc: 'Kushaagra speaks your language. Switch between Hindi, English, Marathi, Tamil, Telugu, Bengali, and more — because opportunity should have no language barrier.',
    icon: '🌐',
    tags: ['8+ Languages', 'Regional', 'Inclusive'],
    stat: '80% users prefer regional lang',
    img: '/images/features/vault.png'
  },
  {
    title: 'Merit Predictor',
    desc: 'Answer 5 quick questions and our AI instantly calculates your eligibility score across 10,000+ opportunities — showing you exactly where you stand a chance.',
    icon: '📊',
    tags: ['Instant Score', 'Eligibility Check', 'Personalized'],
    stat: '93% prediction accuracy',
    img: '/images/features/quest.png'
  },
  {
    title: 'Institutional Linkage',
    desc: 'Direct connection with schools and government bodies for seamless verification and faster disbursements.',
    icon: '🏛️',
    tags: ['NSP Sync', 'Direct Pay', 'Schools'],
    stat: '500+ partner institutions',
    img: '/images/features/network.png'
  },
  {
    title: 'One-Click Apply',
    desc: 'Apply to multiple opportunities in a single click. Your profile, documents, and preferences are pre-filled — just review and submit.',
    icon: '⚡',
    tags: ['Bulk Apply', 'Auto-Fill', 'Fast Track'],
    stat: 'Applied in under 2 mins',
    img: '/images/features/vault.png'
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
                <div className={styles.statRow}>
                  <span className={styles.statIcon}>📈</span>
                  <span className={styles.statText}>{f.stat}</span>
                </div>
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
