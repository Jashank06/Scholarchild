import styles from './SectionDivider.module.css';

export default function SectionDivider({ type = 'default' }) {
  const renderContent = () => {
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
              <span>SCHOLARSHIPS • OLYMPIADS • COMPETITIONS • FELLOWSHIPS • SCHOLARSHIPS • OLYMPIADS • COMPETITIONS • FELLOWSHIPS</span>
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
  };

  return (
    <div className={`${styles.dividerContainer} ${styles[type]}`}>
      <div className={styles.contentWrapper}>
        {renderContent()}
      </div>
    </div>
  );
}
