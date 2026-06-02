'use client';

import { useRouter } from 'next/navigation';
import styles from './BlogCard.module.css';

const catEmoji = {
  scholarships: '🎓', competitions: '🏆', 'career tips': '💼',
  'success stories': '🌟', technology: '💻', community: '🤝',
};

export default function BlogCard({ blog }) {
  const router = useRouter();
  const cat = blog.categories?.[0] || '';
  const emoji = catEmoji[cat.toLowerCase()] || '📄';

  return (
    <article className={styles.card} onClick={() => router.push(`/blogs/${blog.slug}`)}>
      <div className={styles.imageWrap}>
        <div className={styles.imagePlaceholder}>
          <span className={styles.catEmoji}>{emoji}</span>
        </div>
        <span className={styles.catBadge}>{cat || 'General'}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.readTime}>{blog.readTime || '5 min read'}</span>
          <span className={styles.date}>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h3 className={styles.title}>{blog.title}</h3>
        <p className={styles.excerpt}>{blog.excerpt || 'Click to read more about this topic...'}</p>
        <div className={styles.footer}>
          <span className={styles.author}>By {blog.author?.name || 'Kushaagra Team'}</span>
          <span className={styles.views}>👁️ {blog.viewCount || 0}</span>
        </div>
      </div>
    </article>
  );
}
