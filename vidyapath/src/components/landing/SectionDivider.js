import styles from './SectionDivider.module.css';

const waves = {
  blue: { fill: '#E0F0FE', opacity: 0.6 },
  amber: { fill: '#FEF3C7', opacity: 0.6 },
  emerald: { fill: '#D1FAE5', opacity: 0.6 },
  purple: { fill: '#EDE9FE', opacity: 0.6 },
  rose: { fill: '#FEE2E2', opacity: 0.6 },
};

export default function SectionDivider({ type = 'default', color = 'blue' }) {
  const wave = waves[color] || waves.blue;

  if (type === 'wave') {
    return (
      <div className={styles.waveContainer}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={styles.waveSvg}>
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1350,40 1440,40 L1440,0 L0,0 Z"
            fill={wave.fill} opacity={wave.opacity} className={styles.wavePath1} />
          <path d="M0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,80 L0,80 Z"
            fill={wave.fill} opacity={wave.opacity * 0.7} className={styles.wavePath2} />
        </svg>
      </div>
    );
  }

  if (type === 'wave-reverse') {
    return (
      <div className={styles.waveContainer}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={styles.waveSvg}>
          <path d="M0,40 C360,0 720,80 1080,40 C1260,20 1350,40 1440,40 L1440,80 L0,80 Z"
            fill={wave.fill} opacity={wave.opacity} className={styles.wavePath2} />
          <path d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,0 L0,0 Z"
            fill={wave.fill} opacity={wave.opacity * 0.7} className={styles.wavePath1} />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${styles.dividerContainer} ${styles[type]}`}>
      <div className={styles.contentWrapper}>
        {renderContent(type)}
      </div>
    </div>
  );
}

function renderContent(type) {
  switch (type) {
    case 'icons':
      return (
        <div className={styles.iconsFlow}>
          <span>🔍</span>
          <div className={styles.line}></div>
          <span>📝</span>
          <div className={styles.line}></div>
          <span>🏆</span>
        </div>
      );
    case 'marquee':
      return (
        <div className={styles.marquee}>
          <div className={styles.marqueeInner}>
            <span>SCHOLARSHIPS • OLYMPIADS • COMPETITIONS • FELLOWSHIPS • SCHEMES • SCIENCE FAIRS • SCHOLARSHIPS • OLYMPIADS • COMPETITIONS • FELLOWSHIPS • SCHEMES • SCIENCE FAIRS</span>
          </div>
        </div>
      );
    case 'data':
      return (
        <div className={styles.dataStream}>
          <div className={styles.dataNode}>10101</div>
          <div className={styles.dataLine}></div>
          <div className={styles.dataNode}>DATA_SYNC</div>
          <div className={styles.dataLine}></div>
          <div className={styles.dataNode}>01101</div>
        </div>
      );
    case 'pulse':
      return (
        <div className={styles.pulseWave}>
          <div className={styles.waveLine}></div>
          <div className={styles.waveCircle}></div>
          <div className={styles.waveLine}></div>
        </div>
      );
    case 'trust':
      return (
        <div className={styles.trustStrip}>
          <span>TRUSTED BY 100+ SCHOOLS</span>
          <div className={styles.smallPulse}></div>
          <span>VERIFIED DATA</span>
        </div>
      );
    default:
      return <div className={styles.simpleLine}></div>;
  }
}
