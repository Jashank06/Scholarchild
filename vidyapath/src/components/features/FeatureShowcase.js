import styles from './FeatureShowcase.module.css';

const features = [
  {
    title: 'AI Smart Match',
    desc: 'Our match engine analyzes your profile — grade, location, category, income, interests — and scores every opportunity from 0-100%. No more manual searching through thousands of listings.',
    icon: '🧠',
    tags: ['Profile-Based', 'Real-Time', 'Personalized'],
    stat: '0–100 match score on every opportunity',
    img: '/images/features/match.png',
  },
  {
    title: 'Smart Document Vault',
    desc: 'Upload once, use everywhere. Create folders, organize your Aadhaar, marksheets, income certificates, and more. Every document is securely stored and ready when you apply.',
    icon: '🔐',
    tags: ['Auto-Create Folders', 'Encrypted', 'Instant Access'],
    stat: '4 auto-created starter folders on signup',
    img: '/images/features/vault.png',
  },
  {
    title: 'Application Tracker',
    desc: 'Track every application from submission to result. Real-time status updates — Applied, Under Review, Approved, Rejected — with a visual timeline for each opportunity.',
    icon: '📊',
    tags: ['Timeline View', 'Status Updates', 'History Log'],
    stat: 'Full lifecycle tracking per application',
    img: '/images/features/network.png',
  },
  {
    title: 'Scholar Quest — Gamification',
    desc: 'Earn XP, level up from 1 to 12, unlock badges, and maintain streaks. Complete your profile, submit applications, and stay active to climb the leaderboard.',
    icon: '🎮',
    tags: ['10 Badge Types', '12 Levels', 'Streaks'],
    stat: 'XP, badges, and streaks fully live',
    img: '/images/features/quest.png',
  },
  {
    title: 'Parent Connect Hub',
    desc: 'Parents get their own dashboard to link children, monitor applications, track deadlines, download proofs, and review schools — all in one place.',
    icon: '👨‍👩‍👧',
    tags: ['Link Children', 'Monitor Apps', 'School Reviews'],
    stat: 'Full parent portal with 16 tabs',
    img: '/images/features/network.png',
  },
  {
    title: 'Institutional Dashboard',
    desc: 'Schools and institutions get analytics, student management, and the ability to post opportunities. Verified institutions can directly update their public profile.',
    icon: '🏫',
    tags: ['Analytics', 'Student Mgmt', 'Post Opps'],
    stat: 'Token-based school profile updates',
    img: '/images/features/network.png',
  },
  {
    title: 'AI Agent — Discovery Engine',
    desc: 'Our AI scans 347+ sources daily — state portals, education boards, district sites, sports bodies, and more — to find new scholarships, competitions, and schemes automatically.',
    icon: '🤖',
    tags: ['347 Sources', 'Auto-Discovery', 'Self-Learning'],
    stat: 'AI-scanning 347+ sources 24/7',
    img: '/images/features/match.png',
  },
  {
    title: 'Smart Notifications',
    desc: 'Get in-app and email alerts for deadline reminders, application status changes, new matching opportunities, and badge awards. Never miss a critical update.',
    icon: '🔔',
    tags: ['In-App Alerts', 'Email Alerts', 'Status Updates'],
    stat: 'Real-time notifications across channels',
    img: '/images/features/vault.png',
  },
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
                  <span className={styles.statIcon}>✅</span>
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
