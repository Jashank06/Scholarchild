'use client';

import styles from './HowItWorks.module.css';
import useTilt from '@/hooks/useTilt';
import useScrollReveal from '@/hooks/useScrollReveal';

const steps = [
  {
    number: 1,
    icon: '👤',
    title: 'Create Your Profile',
    description: 'Sign up in 60 seconds. Tell us your grade, state, interests, and achievements.',
    features: [
      'Quick OTP-based signup',
      'Smart profile wizard',
      'Auto-detect eligible opportunities',
    ],
  },
  {
    number: 2,
    icon: '🔍',
    title: 'Discover Opportunities',
    description: 'Our AI matches you with the best scholarships, competitions, and schemes.',
    features: [
      'AI Smart Match Score',
      'Advanced filters & search',
      '10,000+ curated listings',
    ],
  },
  {
    number: 3,
    icon: '🚀',
    title: 'Apply & Track',
    description: 'Apply directly or get redirected. Track every application in real-time.',
    features: [
      'One-click apply',
      'Document vault auto-fill',
      'Status notifications',
    ],
  },
];

export default function HowItWorks() {
  const tiltRefs = [useTilt(), useTilt(), useTilt()];
  const gridRef = useScrollReveal({ stagger: 0.15, y: 50 });

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.sectionHeader}>
        <span className="section-label">⚡ The Kushaagra Engine</span>
        <h2 className="section-title">
          How <span className={styles.blueHighlight}>Kushaagra</span> Works
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Experience the most advanced scholarship matching engine in India.
        </p>
      </div>

      <div className={styles.stepsContainer} ref={gridRef}>
        <div className={styles.connectLine}></div>
        {steps.map((step, i) => (
          <div key={step.number} className={styles.stepCard} ref={tiltRefs[i]}>
            <div className={styles.stepNumber}>{step.number}</div>
            <span className={styles.stepIcon}>{step.icon}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            <div className={styles.stepFeatures}>
              {step.features.map((f, i) => (
                <div key={i} className={styles.stepFeature}>
                  <span className={styles.check}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
