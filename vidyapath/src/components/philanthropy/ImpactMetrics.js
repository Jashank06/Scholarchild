import styles from './ImpactMetrics.module.css';

const initiatives = [
  { title: 'The 100 Scholars Program', desc: 'Full-ride scholarships for 100 students from rural backgrounds every year.', icon: '🎓' },
  { title: 'Digital Empowerment Kit', desc: 'Providing high-speed tablets and data connectivity to remote villages.', icon: '💻' },
  { title: 'VidyaPath Mentors', desc: 'Connecting students with industry experts for career guidance.', icon: '🧠' },
];

export default function ImpactMetrics() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.metricGrid}>
          {initiatives.map((item, i) => (
            <div key={i} className={styles.metricCard}>
              <div className={styles.icon}>{item.icon}</div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
