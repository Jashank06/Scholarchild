'use client';

import styles from './Features.module.css';

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionHeader}>
        <span className="section-label">⚡ The Kushaagra Toolkit</span>
        <h2 className="section-title">
          Everything You Need, <span className={styles.featureHighlight}>Nothing You Don&apos;t</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Cutting-edge tools designed for the modern Indian student.
        </p>
      </div>

      <div className={styles.bentoGrid}>
        {/* Card 1 — AI Smart Match (Large) */}
        <div className={`${styles.bentoCard} ${styles.card1}`}>
          <div className={styles.cardIcon}>🧠</div>
          <h3 className={styles.cardTitle}>AI Smart Match</h3>
          <div className={styles.cardStat}>📈 2.4x higher win rate · 98% accuracy</div>
          <p className={styles.cardDescription}>
            Our AI analyzes your profile — grade, location, interests, achievements — and scores 
            every opportunity from 0-100% match. No more manual searching through thousands of listings.
          </p>
          <div className={styles.aiVisual}>
            <div className={`${styles.matchBar} ${styles.matchHigh}`}>
              <span>NTSE Scholarship</span>
              <div className={styles.matchBarFill}></div>
              <span className={styles.matchPercent}>92%</span>
            </div>
            <div className={`${styles.matchBar} ${styles.matchMed}`}>
              <span>Science Olympiad</span>
              <div className={styles.matchBarFill}></div>
              <span className={styles.matchPercent}>75%</span>
            </div>
            <div className={`${styles.matchBar} ${styles.matchLow}`}>
              <span>Art Competition</span>
              <div className={styles.matchBarFill}></div>
              <span className={styles.matchPercent}>60%</span>
            </div>
          </div>
        </div>

        {/* Card 2 — Document Vault */}
        <div className={`${styles.bentoCard} ${styles.card2}`}>
          <div className={styles.cardIcon}>🔐</div>
          <h3 className={styles.cardTitle}>Smart Document Vault</h3>
          <div className={styles.cardStat}>⏱️ Saves 45 mins per application</div>
          <p className={styles.cardDescription}>
            Upload once, use everywhere. Your Aadhaar, marksheets, income certificates — all 
            securely stored and auto-filled in every application.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>Auto-fill</span>
            <span className={styles.miniTag}>Encrypted</span>
            <span className={styles.miniTag}>Verified</span>
          </div>
        </div>

        {/* Card 3 — Deadline Alerts */}
        <div className={`${styles.bentoCard} ${styles.card3}`}>
          <div className={styles.cardIcon}>🔔</div>
          <h3 className={styles.cardTitle}>Smart Alerts</h3>
          <div className={styles.cardStat}>✅ Zero missed deadlines guarantee</div>
          <p className={styles.cardDescription}>
            Never miss a deadline. Get WhatsApp, email, and push notifications for 
            upcoming deadlines and new opportunities.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>WhatsApp</span>
            <span className={styles.miniTag}>Email</span>
            <span className={styles.miniTag}>Push</span>
          </div>
        </div>

        {/* Card 4 — Application Tracker */}
        <div className={`${styles.bentoCard} ${styles.card4}`}>
          <div className={styles.cardIcon}>📊</div>
          <h3 className={styles.cardTitle}>Application Tracker</h3>
          <div className={styles.cardStat}>🔄 100K+ applications tracked monthly</div>
          <p className={styles.cardDescription}>
            Visual timeline of all your applications. See status updates in real-time — 
            Applied, Under Review, Approved, or Rejected.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>Timeline</span>
            <span className={styles.miniTag}>Real-time</span>
          </div>
        </div>

        {/* Card 5 — Gamification */}
        <div className={`${styles.bentoCard} ${styles.card5}`}>
          <div className={styles.cardIcon}>🎮</div>
          <h3 className={styles.cardTitle}>Scholar Quest</h3>
          <div className={styles.cardStat}>🏆 50K+ badges unlocked by students</div>
          <p className={styles.cardDescription}>
            Earn XP, unlock badges, climb leaderboards! Make your scholarship 
            journey fun and rewarding.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>XP Points</span>
            <span className={styles.miniTag}>Badges</span>
            <span className={styles.miniTag}>Streaks</span>
          </div>
        </div>

        {/* Card 6 — Multi-language */}
        <div className={`${styles.bentoCard} ${styles.card6}`}>
          <div className={styles.cardIcon}>🌐</div>
          <h3 className={styles.cardTitle}>Multi-Language Support</h3>
          <div className={styles.cardStat}>🗣️ 80% users prefer their regional language</div>
          <p className={styles.cardDescription}>
            Available in Hindi, English, Marathi, Tamil, Telugu, and more regional languages. 
            Every student can use Kushaagra in their mother tongue.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>हिंदी</span>
            <span className={styles.miniTag}>English</span>
            <span className={styles.miniTag}>मराठी</span>
            <span className={styles.miniTag}>தமிழ்</span>
            <span className={styles.miniTag}>తెలుగు</span>
            <span className={styles.miniTag}>+8 more</span>
          </div>
        </div>

        {/* Card 7 — School Dashboard */}
        <div className={`${styles.bentoCard} ${styles.card7}`}>
          <div className={styles.cardIcon}>🏫</div>
          <h3 className={styles.cardTitle}>School Dashboard</h3>
          <div className={styles.cardStat}>🏛️ 500+ partner institutions onboard</div>
          <p className={styles.cardDescription}>
            Schools and counselors get a dedicated dashboard to recommend opportunities, 
            track student participation, and view analytics.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>Analytics</span>
            <span className={styles.miniTag}>Bulk Assign</span>
            <span className={styles.miniTag}>Reports</span>
          </div>
        </div>
      </div>
    </section>
  );
}
