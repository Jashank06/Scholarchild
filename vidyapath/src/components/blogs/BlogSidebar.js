'use client';

import styles from './BlogSidebar.module.css';

export default function BlogSidebar({ latest, popular, categories, activeCategory, onCategoryClick }) {
  return (
    <aside className={styles.sidebar}>
      {/* Latest */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>
          <span className={styles.widgetIcon}>⚡</span> Latest
        </h3>
        <div className={styles.list}>
          {latest?.map((item) => (
            <a key={item._id} href={`/blogs/${item.slug}`} className={styles.listItem}>
              <span className={styles.listDot} />
              <div>
                <span className={styles.listTitle}>{item.title}</span>
                <span className={styles.listDate}>{new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </a>
          ))}
          {(!latest || latest.length === 0) && <p className={styles.empty}>No articles yet</p>}
        </div>
      </div>

      {/* Most Popular */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>
          <span className={styles.widgetIcon}>🔥</span> Most Popular
        </h3>
        <div className={styles.list}>
          {popular?.map((item, idx) => (
            <a key={item._id} href={`/blogs/${item.slug}`} className={styles.listItem}>
              <span className={styles.rankBadge}>{idx + 1}</span>
              <div>
                <span className={styles.listTitle}>{item.title}</span>
                <span className={styles.listDate}>👁️ {item.viewCount} views</span>
              </div>
            </a>
          ))}
          {(!popular || popular.length === 0) && <p className={styles.empty}>No articles yet</p>}
        </div>
      </div>

      {/* All Blogs — Categories */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>
          <span className={styles.widgetIcon}>📂</span> All Blogs
        </h3>
        <div className={styles.tagCloud}>
          {categories?.map((cat) => (
            <button
              key={cat._id}
              className={`${styles.tag} ${activeCategory === cat._id ? styles.tagActive : ''}`}
              onClick={() => onCategoryClick(cat._id)}
            >
              {cat._id}
              <span className={styles.tagCount}>{cat.count}</span>
            </button>
          ))}
          {activeCategory && (
            <button className={styles.clearBtn} onClick={() => onCategoryClick('')}>
              ✕ Clear filter
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
