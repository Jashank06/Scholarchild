'use client';

import styles from './Features.module.css';
import useTilt from '@/hooks/useTilt';
import useScrollReveal from '@/hooks/useScrollReveal';

export default function Features() {
  const tiltRefs = [useTilt({ maxTilt: 4 }), useTilt(), useTilt(), useTilt(), useTilt(), useTilt(), useTilt()];
  const gridRef = useScrollReveal({ stagger: 0.08, y: 30 });

  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionHeader}>
        <span className="section-label">⚡ The Kushaagra Toolkit</span>
        <h2 className="section-title">
          Everything You Need, <span className={styles.featureHighlight}>Nothing You Don&apos;t</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Real tools built for Indian students — no fluff, no gimmicks.
        </p>
      </div>

      <div className={styles.bentoGrid} ref={gridRef}>
        {/* Card 1 — AI Smart Match (Large) */}
        <div className={`${styles.bentoCard} ${styles.card1}`} ref={tiltRefs[0]}>
          <div className={styles.cardIcon}>🧠</div>
          <h3 className={styles.cardTitle}>AI Smart Match</h3>
          <div className={styles.cardStat}>📊 0–100 match score on every opportunity</div>
          <p className={styles.cardDescription}>
            Your profile — grade, location, category, income, interests — is analyzed against every
            opportunity. No more manual searching through thousands of listings.
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
        <div className={`${styles.bentoCard} ${styles.card2}`} ref={tiltRefs[1]}>
          <div className={styles.cardIcon}>🔐</div>
          <h3 className={styles.cardTitle}>Smart Document Vault</h3>
          <div className={styles.cardStat}>📁 4 auto-created starter folders on signup</div>
          <p className={styles.cardDescription}>
            Upload once, use everywhere. Aadhaar, marksheets, income certificates — all securely
            stored in organized folders and ready when you apply.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>Auto-Folders</span>
            <span className={styles.miniTag}>Encrypted</span>
            <span className={styles.miniTag}>Instant Access</span>
          </div>
        </div>

        {/* Card 3 — Application Tracker */}
        <div className={`${styles.bentoCard} ${styles.card3}`} ref={tiltRefs[2]}>
          <div className={styles.cardIcon}>📊</div>
          <h3 className={styles.cardTitle}>Application Tracker</h3>
          <div className={styles.cardStat}>🔄 Full lifecycle tracking per application</div>
          <p className={styles.cardDescription}>
            Track every application from submission to result. Real-time status updates —
            Applied, Under Review, Approved, or Rejected — with a visual timeline.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>Timeline</span>
            <span className={styles.miniTag}>Status Updates</span>
            <span className={styles.miniTag}>History Log</span>
          </div>
        </div>

        {/* Card 4 — Scholar Quest */}
        <div className={`${styles.bentoCard} ${styles.card4}`} ref={tiltRefs[3]}>
          <div className={styles.cardIcon}>🎮</div>
          <h3 className={styles.cardTitle}>Scholar Quest</h3>
          <div className={styles.cardStat}>🏆 10 badges · 12 levels · streaks</div>
          <p className={styles.cardDescription}>
            Earn XP, unlock badges, maintain streaks, and climb levels. Every application,
            profile update, and login moves you forward.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>XP Points</span>
            <span className={styles.miniTag}>Badges</span>
            <span className={styles.miniTag}>Streaks</span>
          </div>
        </div>

        {/* Card 5 — Parent Connect Hub */}
        <div className={`${styles.bentoCard} ${styles.card5}`} ref={tiltRefs[4]}>
          <div className={styles.cardIcon}>👨‍👩‍👧</div>
          <h3 className={styles.cardTitle}>Parent Connect Hub</h3>
          <div className={styles.cardStat}>👪 Dedicated parent portal with 16 tabs</div>
          <p className={styles.cardDescription}>
            Parents link their children, monitor applications, track deadlines, download
            certificate proofs, and review schools — all from one dashboard.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>Link Children</span>
            <span className={styles.miniTag}>Monitor Apps</span>
            <span className={styles.miniTag}>School Reviews</span>
          </div>
        </div>

        {/* Card 6 — AI Discovery Engine */}
        <div className={`${styles.bentoCard} ${styles.card6}`} ref={tiltRefs[5]}>
          <div className={styles.cardIcon}>🤖</div>
          <h3 className={styles.cardTitle}>AI Discovery Engine</h3>
          <div className={styles.cardStat}>📡 Scanning 347+ sources 24/7</div>
          <p className={styles.cardDescription}>
            State portals, education boards, district sites, sports bodies — our AI finds new
            scholarships, competitions, and schemes automatically, every single day.
          </p>
          <div className={styles.miniFeatures}>
            <span className={styles.miniTag}>347 Sources</span>
            <span className={styles.miniTag}>Auto-Discovery</span>
            <span className={styles.miniTag}>Self-Learning</span>
          </div>
        </div>

        {/* Card 7 — Institutional Dashboard */}
        <div className={`${styles.bentoCard} ${styles.card7}`} ref={tiltRefs[6]}>
          <div className={styles.cardIcon}>🏫</div>
          <h3 className={styles.cardTitle}>Institutional Dashboard</h3>
          <div className={styles.cardStat}>📈 Analytics · Student mgmt · Post opportunities</div>
          <p className={styles.cardDescription}>
            Schools and institutions get analytics, student management, and the ability to post
            opportunities. Verified institutions update their public profile via token link.
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
