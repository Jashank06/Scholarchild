'use client';

import { useRouter } from 'next/navigation';
import styles from './BlogHero.module.css';

export default function BlogHero({ featured }) {
  const router = useRouter();
  if (!featured) return null;

  const cat = featured.categories?.[0] || 'GENERAL';

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className="section-label">📢 Kushaagra Insights</span>
          <h1 className={styles.title}>
            Knowledge is the <span className={styles.highlight}>Greatest</span> Opportunity.
          </h1>
          <p className={styles.subtitle}>
            Explore the latest trends in education, tips for scholarship success,
            and inspiring stories from the Kushaagra community.
          </p>
        </div>

        <div className={styles.featuredCard} onClick={() => router.push(`/blogs/${featured.slug}`)}>
          <div className={styles.featuredBadge}>FEATURED</div>
          <div className={styles.featuredContent}>
            <span className={styles.category}>{cat.toUpperCase()}</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt || 'Click to read more...'}</p>
            <div className={styles.meta}>
              <span>By {featured.author?.name || 'Kushaagra Team'}</span>
              <span>• {featured.readTime || '5 min read'}</span>
              <span>• 👁️ {featured.viewCount || 0}</span>
            </div>
            <button className={styles.readBtn} onClick={(e) => { e.stopPropagation(); router.push(`/blogs/${featured.slug}`); }}>
              Read Article →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
