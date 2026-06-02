'use client';

import Link from 'next/link';
import styles from './Categories.module.css';

const categories = [
  {
    icon: '🎓',
    title: 'Scholarships',
    description: 'Merit-based, need-based, and category-specific scholarships from government and private bodies.',
    count: 'Live',
    countLabel: 'Active Now',
    href: '/scholarships',
  },
  {
    icon: '🏆',
    title: 'Olympiads & Quiz',
    description: 'National and international olympiads in Math, Science, English, Cyber, and more.',
    count: 'Open',
    countLabel: 'Competitions',
    href: '/olympiads',
  },
  {
    icon: '🔬',
    title: 'Science Fairs',
    description: 'INSPIRE Awards, NCSC, IRIS, and science exhibitions from taluka to national level.',
    count: 'Open',
    countLabel: 'Events',
    href: '/science-fairs',
  },
  {
    icon: '🎨',
    title: 'Arts & Culture',
    description: 'Drawing, painting, essay writing, debate, music, and cultural competitions.',
    count: 'Open',
    countLabel: 'Contests',
    href: '/art-competitions',
  },
  {
    icon: '💻',
    title: 'Coding & Tech',
    description: 'Hackathons, coding competitions, robotics, and STEM challenges for young innovators.',
    count: 'Live',
    countLabel: 'Programs',
    href: '/competitions',
  },
  {
    icon: '🏛️',
    title: 'Govt. Schemes',
    description: 'Central and state government welfare schemes, fellowships, and educational aids.',
    count: 'Active',
    countLabel: 'Schemes',
    href: '/government-schemes',
  },
];

export default function Categories() {
  return (
    <section className={styles.section} id="categories">
      <div className={styles.sectionHeader}>
        <span className="section-label">⚡ Infinite Opportunities</span>
        <h2 className="section-title">
          Explore <span className={styles.titleHighlight}>Opportunities</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Join 10L+ students finding their path to success.
        </p>
      </div>

      <div className={styles.categoriesGrid}>
        {categories.map((cat, idx) => (
          <Link key={idx} href={cat.href} className={styles.categoryCard}>
            <div className={styles.cardIconWrap}>
              {cat.icon}
            </div>
            <h3 className={styles.cardTitle}>{cat.title}</h3>
            <p className={styles.cardDescription}>{cat.description}</p>
            <div className={styles.cardFooter}>
              <div>
                <div className={styles.cardCount}>{cat.count}</div>
                <div className={styles.cardCountLabel}>{cat.countLabel}</div>
              </div>
              <span className={styles.exploreBtn}>
                Explore <span className={styles.arrow}>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
