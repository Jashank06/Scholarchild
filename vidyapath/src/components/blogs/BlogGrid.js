'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import BlogCard from './BlogCard';
import BlogSidebar from './BlogSidebar';
import styles from './BlogGrid.module.css';

export default function BlogGrid() {
  const [blogs, setBlogs] = useState([]);
  const [sidebar, setSidebar] = useState({ latest: [], popular: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSort, setActiveSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [search, setSearch] = useState('');

  const categories = ['All', 'Scholarships', 'Competitions', 'Career Tips', 'Success Stories', 'Technology'];

  useEffect(() => {
    fetchBlogs();
  }, [activeCategory, activeSort, page, search]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = { sort: activeSort, page, limit: 9 };
      if (activeCategory) params.category = activeCategory;
      if (search) params.search = search;

      const res = await api.getBlogs(params);
      setBlogs(res.data || []);
      setSidebar(res.sidebar || { latest: [], popular: [], categories: [] });
      setPagination(res.pagination || { total: 0, pages: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (cat) => {
    setActiveCategory(activeCategory === cat ? '' : cat);
    setPage(1);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.filters}>
            {categories.map((cat) => (
              <span
                key={cat}
                className={`${styles.filterItem} ${activeCategory === cat || (cat === 'All' && !activeCategory) ? styles.filterActive : ''}`}
                onClick={() => handleCategory(cat === 'All' ? '' : cat)}
              >
                {cat}
              </span>
            ))}
          </div>
          <div className={styles.sortSearch}>
            <div className={styles.sortGroup}>
              <button
                className={`${styles.sortBtn} ${activeSort === 'latest' ? styles.sortActive : ''}`}
                onClick={() => { setActiveSort('latest'); setPage(1); }}
              >
                ⚡ Latest
              </button>
              <button
                className={`${styles.sortBtn} ${activeSort === 'popular' ? styles.sortActive : ''}`}
                onClick={() => { setActiveSort('popular'); setPage(1); }}
              >
                🔥 Popular
              </button>
            </div>
            <div className={styles.searchWrap}>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainContent}>
            {loading ? (
              <div className={styles.loadingGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyEmoji}>📝</span>
                <h3>No articles found</h3>
                <p>Check back soon for new content!</p>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
                {pagination.pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      ← Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      className={styles.pageBtn}
                      disabled={page >= pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.sidebarWrap}>
            <BlogSidebar
              latest={sidebar.latest}
              popular={sidebar.popular}
              categories={sidebar.categories}
              activeCategory={activeCategory}
              onCategoryClick={handleCategory}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
