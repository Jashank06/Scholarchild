'use client';

import styles from './AboutAim.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';

const pillars = [
  {
    icon: '💰',
    title: 'Financial Barrier Removal',
    desc: 'No child is left out of school for not being able to pay school fees.',
  },
  {
    icon: '🚌',
    title: 'Access & Transportation',
    desc: 'No child is left out of school for not being able to reach school.',
  },
  {
    icon: '🚰',
    title: 'Basic Amenities',
    desc: 'Drinking water and washroom facilities for every school.',
  },
  {
    icon: '👩‍🏫',
    title: 'Quality Education',
    desc: 'Provide trained teachers and effective school management.',
  },
];

export default function AboutAim() {
  const gridRef = useScrollReveal({ stagger: 0.12, y: 30 });
  const contentRef = useScrollReveal({});

  return (
    <section className={styles.section} id="about-aim">
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.container}>
        <div className={styles.header} ref={contentRef}>
          <span className="section-label">🎯 Our Ultimate Aim</span>
          <h2 className="section-title">
            Every Child Deserves a{' '}
            <span className={styles.highlight}>Fair Chance</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
            Kushaagra is more than a platform — it&apos;s a mission to ensure no student is left
            behind. These are the pillars we stand by.
          </p>
        </div>

        <div className={styles.pillarsGrid} ref={gridRef}>
          {pillars.map((pillar, idx) => (
            <div key={idx} className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <span className={styles.pillarIcon}>{pillar.icon}</span>
              </div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.fundingSection} ref={contentRef}>
          <div className={styles.fundingLabel}>Revenue Distribution</div>
          <div className={styles.fundingBars}>
            <div className={styles.fundingBarWrap}>
              <div className={styles.fundingBar}>
                <div className={styles.fundingFillMaintenance} style={{ width: '20%' }}>
                  <span className={styles.fundingPercent}>20%</span>
                </div>
              </div>
              <span className={styles.fundingText}>Platform Maintenance</span>
            </div>
            <div className={styles.fundingBarWrap}>
              <div className={styles.fundingBar}>
                <div className={styles.fundingFillFoundation} style={{ width: '80%' }}>
                  <span className={styles.fundingPercent}>80%</span>
                </div>
              </div>
              <span className={styles.fundingText}>
                <a href="https://venshitafoundation.org" target="_blank" rel="noopener noreferrer" className={styles.fundingLink}>Venshita Foundation</a>
              </span>
            </div>
          </div>
          <p className={styles.fundingFootnote}>
            Every rupee earned goes back into the mission — empowering students across India.
          </p>
        </div>
      </div>
    </section>
  );
}
