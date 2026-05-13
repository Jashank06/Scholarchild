import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import AboutHero from '@/components/about/AboutHero';
import CorePillars from '@/components/about/CorePillars';
import SectionDivider from '@/components/landing/SectionDivider';
import styles from './About.module.css';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <AboutHero />
        <SectionDivider type="marquee" />
        
        <section className={styles.missionSection}>
          <div className={styles.container}>
            <div className={styles.missionGrid}>
              <div className={styles.missionContent}>
                <span className="section-label">🎯 Our Mission</span>
                <h2 className="section-title">Bridging the Gap Between <span className={styles.highlight}>Potential</span> and Opportunity.</h2>
                <p className={styles.missionText}>
                  India is home to millions of talented students who often miss out on life-changing opportunities 
                  simply because they didn't know they existed. VidyaPath was born in 2024 to solve this information 
                  asymmetry once and for all.
                </p>
                <div className={styles.missionList}>
                  <div className={styles.missionItem}>
                    <div className={styles.missionIcon}>⚡</div>
                    <div>
                      <h4>Real-time Intelligence</h4>
                      <p>We use AI to scan thousands of sources every hour, ensuring you never miss a deadline.</p>
                    </div>
                  </div>
                  <div className={styles.missionItem}>
                    <div className={styles.missionIcon}>🛡️</div>
                    <div>
                      <h4>Trust & Verification</h4>
                      <p>Every listing is manually verified by our team to protect students from scams.</p>
                    </div>
                  </div>
                  <div className={styles.missionItem}>
                    <div className={styles.missionIcon}>🤝</div>
                    <div>
                      <h4>End-to-End Support</h4>
                      <p>From discovery to application, our platform guides you at every single step.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.missionVisual}>
                <div className={styles.glassOrb}>
                  <div className={styles.innerCore}></div>
                  <div className={styles.orbitLine}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider type="data" />
        <CorePillars />
        <SectionDivider type="pulse" />
        
        {/* Our Values Section */}
        <section className={styles.valuesSection}>
          <div className={styles.container}>
            <div className={styles.header}>
              <span className="section-label">⚖️ Our Values</span>
              <h2 className="section-title">What Drives <span className={styles.highlight}>VidyaPath</span></h2>
            </div>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueEmoji}>🚀</div>
                <h3>Student-First</h3>
                <p>Every feature we build is designed to make the student's journey easier and more successful.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueEmoji}>🔒</div>
                <h3>Absolute Integrity</h3>
                <p>We maintain the highest standards of data privacy and transparency in all our operations.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueEmoji}>🌈</div>
                <h3>Radical Inclusion</h3>
                <p>Ensuring accessibility for students from the remotest parts of India is our primary goal.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
