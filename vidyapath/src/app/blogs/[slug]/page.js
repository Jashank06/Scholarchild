'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import api from '@/lib/api';
import styles from './BlogDetail.module.css';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [commentStatus, setCommentStatus] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await api.getBlog(slug);
      setBlog(res.data);
      setRelated(res.related || []);
      setLikeCount(res.data.likes?.length || 0);
      const ratings = res.data.ratings || [];
      if (ratings.length > 0) {
        setAvgRating(parseFloat((ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1)));
        setRatingCount(ratings.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = api.getToken();
      if (!token) { router.push('/auth'); return; }
      const res = await api.toggleBlogLike(blog._id);
      setLiked(res.liked);
      setLikeCount(res.likes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRate = async (score) => {
    try {
      const token = api.getToken();
      if (!token) { router.push('/auth'); return; }
      const res = await api.rateBlog(blog._id, score);
      setUserRating(score);
      setAvgRating(res.average);
      setRatingCount(res.count);
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setCommentStatus('');
    if (!commentForm.name || !commentForm.email || !commentForm.content) {
      setCommentStatus('Please fill in all fields');
      return;
    }
    try {
      const res = await api.commentOnBlog(blog._id, commentForm);
      setBlog((prev) => ({ ...prev, comments: [...prev.comments, res.data] }));
      setCommentForm({ name: '', email: '', content: '' });
      setCommentStatus('✅ Comment posted successfully!');
      setTimeout(() => setCommentStatus(''), 3000);
    } catch (e) {
      setCommentStatus('❌ ' + (e.message || 'Failed to post comment'));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog.title, url: window.location.href }).catch(() => {});
    } else {
      setShowShare(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShare(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingWrap}>
          <div className={styles.loadingOrb} />
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingWrap}>
          <h2>Blog not found</h2>
          <button onClick={() => router.push('/blogs')} className={styles.backBtn}>← Back to Blogs</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.progressBar} style={{ width: `${readProgress}%` }} />
      <main className={styles.main}>
        <div className={styles.container}>
          <button onClick={() => router.push('/blogs')} className={styles.backBtn}>← Back to Blogs</button>

          {/* Featured Image */}
          <div className={styles.heroImage}>
            <div className={styles.heroOverlay} />
            <div className={styles.heroContent}>
              <span className={styles.heroCat}>{blog.categories?.[0] || 'General'}</span>
              <h1 className={styles.heroTitle}>{blog.title}</h1>
              <div className={styles.heroMeta}>
                <span>By {blog.author?.name || 'Kushaagra Team'}</span>
                <span>•</span>
                <span>{blog.readTime || '5 min read'}</span>
                <span>•</span>
                <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.contentWrap}>
            <article className={styles.article} ref={contentRef}>
              {blog.excerpt && <p className={styles.lead}>{blog.excerpt}</p>}
              <div className={styles.content} dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content available yet.</p>' }} />

              {/* Author */}
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>
                  {blog.author?.avatar ? (
                    <img src={api.getImageUrl(blog.author.avatar)} alt={blog.author.name} />
                  ) : (
                    <span>📝</span>
                  )}
                </div>
                <div>
                  <strong>{blog.author?.name || 'Kushaagra Team'}</strong>
                  <p>{blog.author?.bio || 'The official Kushaagra editorial team.'}</p>
                </div>
              </div>
            </article>

            {/* Interaction Bar */}
            <div className={styles.interactionBar}>
              <div className={styles.interactionLeft}>
                <button className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} onClick={handleLike}>
                  {liked ? '❤️' : '🤍'} <span>{likeCount}</span>
                </button>
                <button className={styles.shareBtn} onClick={handleShare}>
                  🔗 Share
                </button>
              </div>

              {/* Star Rating */}
              <div className={styles.ratingWrap}>
                <span className={styles.ratingLabel}>Rate this article</span>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`${styles.star} ${star <= (userRating || Math.round(avgRating)) ? styles.starActive : ''}`}
                      onClick={() => handleRate(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className={styles.ratingInfo}>{avgRating > 0 ? `${avgRating} (${ratingCount})` : 'No ratings'}</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>Comments ({blog.comments?.length || 0})</h2>

            <form className={styles.commentForm} onSubmit={handleComment}>
              <h3>Leave a Comment</h3>
              {commentStatus && <div className={styles.commentStatus}>{commentStatus}</div>}
              <div className={styles.commentRow}>
                <input type="text" placeholder="Your Name *" value={commentForm.name}
                  onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} required />
                <input type="email" placeholder="Your Email *" value={commentForm.email}
                  onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })} required />
              </div>
              <textarea placeholder="Write your comment... *" value={commentForm.content}
                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} required rows={4} />
              <button type="submit" className={styles.submitComment}>Post Comment</button>
            </form>

            <div className={styles.commentsList}>
              {(blog.comments || []).slice().reverse().map((c, i) => (
                <div key={c._id || i} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAvatar}>{c.name[0]?.toUpperCase() || '?'}</span>
                    <div>
                      <span className={styles.commentName}>{c.name}</span>
                      <span className={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className={styles.commentContent}>{c.content}</p>
                  {c.replies?.map((r, j) => (
                    <div key={j} className={styles.reply}>
                      <div className={styles.commentHeader}>
                        <span className={styles.replyAvatar}>🛡️</span>
                        <div>
                          <span className={styles.commentName}>{r.name}</span>
                          <span className={styles.commentDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className={styles.commentContent}>{r.content}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Related Blogs */}
          {related.length > 0 && (
            <div className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>Related Articles</h2>
              <div className={styles.relatedGrid}>
                {related.map((item) => (
                  <div key={item._id} className={styles.relatedCard} onClick={() => router.push(`/blogs/${item.slug}`)}>
                    <div className={styles.relatedImage}>
                      <span className={styles.relatedEmoji}>📄</span>
                    </div>
                    <h3>{item.title}</h3>
                    <span className={styles.relatedMeta}>{item.readTime || '5 min read'} • {new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShare && (
        <div className={styles.shareModal} onClick={() => setShowShare(false)}>
          <div className={styles.shareModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Share this article</h3>
            <div className={styles.shareLink}>
              <input type="text" value={typeof window !== 'undefined' ? window.location.href : ''} readOnly />
              <button onClick={copyLink}>Copy Link</button>
            </div>
            <button className={styles.shareClose} onClick={() => setShowShare(false)}>Close</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
