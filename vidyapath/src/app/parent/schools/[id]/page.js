'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import StarRating from '@/components/ui/StarRating';
import ReviewModal from '@/components/schools/ReviewModal';

const ratingCategories = [
  { key: 'academics', label: 'Academics', emoji: '📚' },
  { key: 'infrastructure', label: 'Infrastructure', emoji: '🏗️' },
  { key: 'faculty', label: 'Faculty & Teachers', emoji: '👨‍🏫' },
  { key: 'extracurricular', label: 'Extracurricular', emoji: '🎨' },
  { key: 'safety', label: 'Safety & Environment', emoji: '🛡️' },
  { key: 'communication', label: 'Communication', emoji: '📢' },
  { key: 'valueForMoney', label: 'Value for Money', emoji: '💰' },
];

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [school, setSchool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [userReview, setUserReview] = useState(null);
  const [user, setUser] = useState(null);

  const fetchSchoolAndReviews = useCallback(async () => {
    setLoading(true);
    try {
      const [schoolRes, userRes] = await Promise.all([
        api.getSchool(params.id),
        api.getMe().catch(() => ({ user: null })),
      ]);
      
      setSchool(schoolRes.data?.school || schoolRes.school);
      setUser(userRes.user || null);

      // Check if user already reviewed
      const myReviews = await api.getMyReviews().catch(() => ({ data: [] }));
      const existing = myReviews.data?.find(r => r.schoolId?._id === params.id);
      setUserReview(existing || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchSchoolAndReviews();
  }, [fetchSchoolAndReviews]);

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    fetchSchoolAndReviews();
  };

  const handleHelpful = async (reviewId) => {
    try {
      const res = await api.request(`/schools/${params.id}/reviews/${reviewId}/helpful`, { method: 'POST' });
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, helpfulCount: res.helpfulCount } : r));
    } catch (e) { console.error(e); }
  };

  const renderStars = (rating, size = 28) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ 
            fontSize: `${size}px`, 
            color: i <= Math.round(rating) ? '#FBBF24' : '#D1D5DB',
          }}>★</span>
        ))}
      </div>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} year${diffDays > 730 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', animation: 'pulse 1.5s infinite' }}>🏫</div>
          <p style={{ color: '#6B7280', marginTop: '16px' }}>Loading school details...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏫</div>
        <h2 style={{ color: '#374151', marginBottom: '12px' }}>School not found</h2>
        <button onClick={() => router.push('/parent/schools')} style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: '700',
        }}>← Back to Schools</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back Button */}
      <button onClick={() => router.push('/parent/schools')} style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
        background: '#F3F4F6', border: 'none', borderRadius: '100px',
        cursor: 'pointer', color: '#374151', fontWeight: '600', fontSize: '14px',
        marginBottom: '24px',
      }}>← Back to Schools</button>

      {/* School Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '28px', padding: '40px', color: 'white', marginBottom: '32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
          background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '100px', width: '120px', height: '120px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', position: 'relative' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>{school.name}</h1>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px' }}>
              📍 {school.address?.city}, {school.address?.district}, {school.address?.state} {school.address?.pincode ? `• ${school.address.pincode}` : ''}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {school.board && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>{school.board}</span>}
              {school.type && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700', textTransform: 'capitalize' }}>{school.type}</span>}
              {school.isVerified && <span style={{ background: '#10B981', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>✓ Verified</span>}
            </div>
          </div>
          
          {school.ratings?.totalReviews > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '48px', fontWeight: '900' }}>{school.ratings.overall?.toFixed(1)}</div>
              {renderStars(school.ratings.overall)}
              <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>{school.ratings.totalReviews} reviews</p>
            </div>
          )}
        </div>

        {school.contact && (
          <div style={{ display: 'flex', gap: '20px', marginTop: '24px', fontSize: '14px' }}>
            {school.contact.phone && <span>📞 {school.contact.phone}</span>}
            {school.contact.email && <span>✉️ {school.contact.email}</span>}
            {school.contact.website && <span>🌐 {school.contact.website}</span>}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* Left Column - Reviews */}
        <div>
          {/* Write Review Button */}
          <div style={{ 
            background: 'white', borderRadius: '20px', padding: '24px', 
            border: '1px solid #E5E7EB', marginBottom: '24px', textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Share Your Experience</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
              Help other parents make informed decisions about this school.
            </p>
            <button onClick={() => setShowReviewModal(true)} style={{
              padding: '14px 36px', background: userReview ? '#10B981' : '#2563EB',
              color: 'white', border: 'none', borderRadius: '100px', 
              fontWeight: '800', cursor: 'pointer', fontSize: '15px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
              {userReview ? '✏️ Edit Your Review' : '⭐ Write a Review'}
            </button>
            {userReview && (
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                You reviewed this school on {new Date(userReview.createdAt).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>

          {/* Sort Options */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              Reviews ({school.ratings?.totalReviews || 0})
            </h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
              padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: '12px',
              fontSize: '14px', cursor: 'pointer',
            }}>
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div style={{
              background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px',
              padding: '60px', textAlign: 'center', color: '#6B7280',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>No reviews yet</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Be the first to review this school!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{
                  background: 'white', borderRadius: '20px', padding: '28px',
                  border: '1px solid #E5E7EB', transition: 'all 0.3s ease',
                }}>
                  {/* Review Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: review.reviewType === 'admin' 
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : review.reviewType === 'parent'
                          ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                          : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '800', fontSize: '16px',
                      }}>
                        {review.userId?.profile?.avatar ? (
                          <img src={review.userId.profile.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(review.userId?.profile?.firstName + ' ' + review.userId?.profile?.lastName)
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#0B0B1A', fontSize: '15px' }}>
                            {review.userId?.profile?.firstName} {review.userId?.profile?.lastName?.[0]}.
                          </span>
                          {review.reviewType === 'admin' && (
                            <span style={{ background: '#7C3AED', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>ADMIN</span>
                          )}
                          {review.isVerified && (
                            <span style={{ background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>✓ Verified</span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          {review.reviewType === 'parent' && review.childGrade ? `Parent of Grade ${review.childGrade} student` : review.reviewType}
                          {review.visitDate && ` • Visited ${formatDate(review.visitDate)}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563EB' }}>
                        ⭐ {review.ratings?.overall?.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{formatDate(review.createdAt)}</div>
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0B0B1A', marginBottom: '8px' }}>
                      {review.title}
                    </h4>
                  )}

                  {/* Rating Categories */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {ratingCategories.map(cat => (
                      <div key={cat.key} style={{
                        background: '#F9FAFB', padding: '10px', borderRadius: '12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{cat.emoji} {cat.label}</span>
                        <span style={{ fontWeight: '800', color: '#2563EB', fontSize: '13px' }}>
                          {review.ratings?.[cat.key]?.toFixed(1) || '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                      {review.comment}
                    </p>
                  )}

                  {/* Pros & Cons */}
                  {(review.pros?.length > 0 || review.cons?.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      {review.pros?.length > 0 && (
                        <div style={{ background: '#ECFDF5', padding: '14px', borderRadius: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#059669', marginBottom: '8px' }}>👍 PROS</div>
                          {review.pros.map((pro, i) => (
                            <div key={i} style={{ fontSize: '13px', color: '#065F46', marginBottom: '4px' }}>• {pro}</div>
                          ))}
                        </div>
                      )}
                      {review.cons?.length > 0 && (
                        <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#DC2626', marginBottom: '8px' }}>👎 CONS</div>
                          {review.cons.map((con, i) => (
                            <div key={i} style={{ fontSize: '13px', color: '#991B1B', marginBottom: '4px' }}>• {con}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* School Response */}
                  {review.schoolResponse?.responded && (
                    <div style={{ 
                      background: '#EFF6FF', padding: '16px', borderRadius: '12px',
                      border: '1px solid #BFDBFE', marginBottom: '16px',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#2563EB', marginBottom: '8px' }}>
                        🏫 School's Response
                      </div>
                      <p style={{ fontSize: '14px', color: '#1E40AF', lineHeight: '1.6' }}>
                        {review.schoolResponse.message}
                      </p>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                        {review.schoolResponse.respondedAt && `Responded ${formatDate(review.schoolResponse.respondedAt)}`}
                      </div>
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '16px',
                    borderTop: '1px solid #E5E7EB', paddingTop: '16px',
                  }}>
                    <button onClick={() => handleHelpful(review._id)} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', background: '#F9FAFB', border: '1px solid #E5E7EB',
                      borderRadius: '100px', cursor: 'pointer', fontSize: '13px', color: '#6B7280',
                      transition: 'all 0.2s ease',
                    }}>
                      👍 Helpful ({review.helpfulCount || 0})
                    </button>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '13px', color: '#9CA3AF',
                    }}>
                      🚩 Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Rating Breakdown */}
        <div>
          {/* Rating Breakdown */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '28px',
            border: '1px solid #E5E7EB', marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Rating Breakdown</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '28px', padding: '24px', background: '#F9FAFB', borderRadius: '16px' }}>
              <div style={{ fontSize: '56px', fontWeight: '900', color: '#0B0B1A' }}>
                {school.ratings?.overall?.toFixed(1) || '—'}
              </div>
              {renderStars(school.ratings?.overall || 0, 24)}
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>
                Based on {school.ratings?.totalReviews || 0} reviews
              </p>
            </div>

            {/* Individual Category Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ratingCategories.map(cat => {
                const rating = school.ratings?.[cat.key] || 0;
                const percentage = (rating / 5) * 100;
                return (
                  <div key={cat.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#374151' }}>{cat.emoji} {cat.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                        {rating > 0 ? rating.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentage}%`, height: '100%',
                        background: rating >= 4 ? '#10B981' : rating >= 3 ? '#F59E0B' : '#EF4444',
                        borderRadius: '100px', transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Info */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '28px',
            border: '1px solid #E5E7EB',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>School Info</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {school.facilities && (
                <>
                  {school.facilities.hasComputerLab && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>💻</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>Computer Lab</span>
                    </div>
                  )}
                  {school.facilities.hasLibrary && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📚</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>Library</span>
                    </div>
                  )}
                  {school.facilities.hasPlayground && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>🏃</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>Playground</span>
                    </div>
                  )}
                  {school.facilities.hasSmartClasses && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📱</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>Smart Classes</span>
                    </div>
                  )}
                </>
              )}
              
              {school.stats && (
                <>
                  {school.stats.totalStudents && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>👥</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{school.stats.totalStudents.toLocaleString()} Students</span>
                    </div>
                  )}
                  {school.stats.studentTeacherRatio && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>Teacher-Student Ratio: {school.stats.studentTeacherRatio}:1</span>
                    </div>
                  )}
                  {school.stats.avgPassPercentage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📊</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>Pass Rate: {school.stats.avgPassPercentage}%</span>
                    </div>
                  )}
                </>
              )}

              {school.udiseCode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>🏢</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>UDISE: {school.udiseCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          school={school}
          existingReview={userReview}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}