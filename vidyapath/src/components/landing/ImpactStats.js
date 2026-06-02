'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ImpactStats.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';

function AnimCounter({ end, prefix = '', suffix = '', duration = 2500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const step = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

export default function ImpactStats() {
  const [stats, setStats] = useState([
    { icon: '🎓', end: 0, suffix: '+', label: 'Scholarships & Competitions', sublabel: 'Curated & verified listings' },
    { icon: '🏛️', end: 0, suffix: '+', label: 'Organizations', sublabel: 'Govt, NGOs, Corporates' },
    { icon: '🌍', end: 36, suffix: '', label: 'States & UTs', sublabel: 'Pan-India coverage' },
    { icon: '💰', end: 0, prefix: '₹', suffix: 'Cr+', label: 'Worth of Rewards', sublabel: 'In scholarships & prizes' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${API_URL}/public-stats`);
        const json = await res.json();
        if (json.success) {
          setStats([
            { icon: '🎓', end: json.data.opportunities || 1000, suffix: '+', label: 'Scholarships & Competitions', sublabel: 'Curated & verified listings' },
            { icon: '🏛️', end: 50, suffix: '+', label: 'Organizations', sublabel: 'Govt, NGOs, Corporates' },
            { icon: '🌍', end: 36, suffix: '', label: 'States & UTs', sublabel: 'Pan-India coverage' },
            { icon: '💰', end: 10, prefix: '₹', suffix: 'Cr+', label: 'Worth of Rewards', sublabel: 'In scholarships & prizes' },
          ]);
        }
      } catch (e) {
        // Fallback to static numbers if API fails
        setStats([
          { icon: '🎓', end: 1000, suffix: '+', label: 'Scholarships & Competitions', sublabel: 'Curated & verified listings' },
          { icon: '🏛️', end: 50, suffix: '+', label: 'Organizations', sublabel: 'Govt, NGOs, Corporates' },
          { icon: '🌍', end: 36, suffix: '', label: 'States & UTs', sublabel: 'Pan-India coverage' },
          { icon: '💰', end: 10, prefix: '₹', suffix: 'Cr+', label: 'Worth of Rewards', sublabel: 'In scholarships & prizes' },
        ]);
      }
    };
    fetchStats();
  }, []);

  const gridRef = useScrollReveal({ stagger: 0.15, y: 30 });

  return (
    <section className={styles.section} id="impact">
      <div className={styles.sectionHeader}>
        <span className="section-label">💎 The Impact Metric</span>
        <h2 className="section-title">
          Numbers That <span className={styles.speakHighlight}>Speak</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Join the movement empowering millions of students across India.
        </p>
      </div>

      <div className={styles.statsGrid} ref={gridRef}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <span className={styles.statIcon}>{stat.icon}</span>
            <div className={styles.statNumber}>
              <AnimCounter
                end={stat.end}
                prefix={stat.prefix || ''}
                suffix={stat.suffix}
              />
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statSublabel}>{stat.sublabel}</div>
          </div>
        ))}
      </div>

      <div className={styles.liveIndicator}>
        <span className={styles.liveDot}></span>
        Updated in real-time • Data verified weekly
      </div>
    </section>
  );
}
