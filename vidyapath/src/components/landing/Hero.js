'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
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
            const eased = 1 - Math.pow(1 - progress, 3);
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

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

function Typewriter({ words, speed = 150, delay = 2000 }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), delay);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, speed, delay]);

  return <span>{words[index].substring(0, subIndex)}</span>;
}

export default function Hero() {
  const router = useRouter();
  const words = ["Future", "Dreams", "Career", "Success"];

  const handleStart = () => {
    router.push('/auth');
  };

  return (
    <section className={styles.hero} id="hero">
      {/* Background Image (Flattened Design) */}
      <div className={styles.heroBackground}>
        <img
          src="/hero-bg.png"
          alt="VidyaPath Background"
          className={styles.bgImage}
        />
        <div className={styles.videoOverlay}></div>
      </div>

      <div className={styles.heroContainer}>
        {/* Main Content Layout */}
        <div className={styles.heroLayout}>
          {/* Left Column: Information */}
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <span className={styles.star}>⭐</span>
              India's #1 Student Opportunity Platform
            </div>

            <h1 className={styles.heroTitle}>
              Unlock Your <br />
              <span className={styles.highlight}>
                <Typewriter words={words} />
                <span className={styles.cursor}>|</span>
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              Discover scholarships, competitions & government schemes
              tailored for students across India.
            </p>

            <div className={styles.heroCta}>
              <button className={styles.ctaPrimary} onClick={handleStart}>
                Explore Opportunities →
              </button>
              <button className={styles.ctaSecondary} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Watch Demo <span className={styles.playIcon}>▶</span>
              </button>
            </div>

            {/* Moved Stats Bar Up */}
            <div className={styles.statsBar}>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>🎓</span>
                <div>
                  <h3><AnimatedCounter end={10000} suffix="+" /></h3>
                  <p>Scholarships</p>
                </div>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>🏆</span>
                <div>
                  <h3><AnimatedCounter end={5000} suffix="+" /></h3>
                  <p>Competitions</p>
                </div>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>🏛️</span>
                <div>
                  <h3><AnimatedCounter end={200} suffix="+" /></h3>
                  <p>Govt. Schemes</p>
                </div>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>👥</span>
                <div>
                  <h3><AnimatedCounter end={10} suffix="L+" /></h3>
                  <p>Students Benefited</p>
                </div>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>📍</span>
                <div>
                  <h3><AnimatedCounter end={36} suffix="" /></h3>
                  <p>States Covered</p>
                </div>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>⭐</span>
                <div>
                  <h3>4.8/5</h3>
                  <p>Student Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className={styles.partnersSection}>
          <p>Trusted by Leading Organizations</p>
          <div className={styles.partnerLogos}>
            <span className={styles.partnerLogo}>Ministry of Education</span>
            <span className={styles.partnerLogo}>MyGov</span>
            <span className={styles.partnerLogo}>NSP</span>
            <span className={styles.partnerLogo}>Digital India</span>
            <span className={styles.partnerLogo}>NASSCOM</span>
            <span className={styles.partnerLogo}>UNICEF</span>
          </div>
        </div>
      </div>
    </section>
  );
}
