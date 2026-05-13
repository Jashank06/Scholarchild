'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './Testimonials.module.css';
import api from '@/lib/api';

export default function Testimonials() {
  const trackRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Using getMyReviews for now as a source of live data
        // In a real app, this would be a public endpoint for featured reviews
        const res = await api.request('/schools/user/reviews'); 
        setReviews(res.data || []);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const scrollLeft = track.scrollLeft;
      const cardWidth = track.children[0]?.offsetWidth + 24;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIdx(idx);
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [reviews]);

  const scrollToIdx = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.children[0]?.offsetWidth + 24;
    track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
  };

  if (loading) return null;
  if (reviews.length === 0) return null; // Hide section if no real data

  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.sectionHeader}>
        <span className="section-label">✨ Student Success</span>
        <h2 className="section-title">
          Loved by <span className={styles.highlightText}>Students & Parents</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Hear from the thousands who found their path with VidyaPath.
        </p>
      </div>

      <div className={styles.testimonialTrack} ref={trackRef}>
        {reviews.map((t, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.stars}>
              {[...Array(t.rating || 5)].map((_, i) => (
                <span key={i} className={styles.star}>★</span>
              ))}
            </div>
            <p className={styles.quote}>{t.comment}</p>
            <div className={styles.author}>
              <div className={styles.avatar} style={{ background: 'var(--gradient-primary)' }}>
                {t.userId?.profile?.firstName?.[0] || '👤'}
              </div>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>{t.userId?.profile?.firstName} {t.userId?.profile?.lastName}</div>
                <div className={styles.authorMeta}>Verified User • {new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.scrollDots}>
        {reviews.map((_, idx) => (
          <div
            key={idx}
            className={`${styles.dot} ${activeIdx === idx ? styles.active : ''}`}
            onClick={() => scrollToIdx(idx)}
          ></div>
        ))}
      </div>
    </section>
  );
}
