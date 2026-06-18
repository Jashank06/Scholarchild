'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import EventReviewModal from '@/components/schools/EventReviewModal';
import AddEventModal from '@/components/schools/AddEventModal';
import HistoryPanel from '@/components/schools/HistoryPanel';

const ratingCategories = [
  { key: 'experience', label: 'Experience', emoji: '⭐' },
  { key: 'organization', label: 'Organization', emoji: '📋' },
  { key: 'value', label: 'Value', emoji: '💰' },
  { key: 'engagement', label: 'Engagement', emoji: '🎯' },
];

const statusColor = (s) => {
  if (s === 'upcoming') return '#059669'; if (s === 'ongoing') return '#2563EB';
  if (s === 'completed') return '#6B7280'; return '#DC2626';
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes] = await Promise.all([api.getEvent(params.id)]);
      setEvent(evRes.event || evRes.data?.event);
      setReviews(evRes.reviews || []);

      const myReviews = await api.getMyEventReviews().catch(() => ({ data: [] }));
      const existing = (myReviews.data || []).find(r => r.eventId?._id === params.id);
      setUserReview(existing || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderStars = (rating, size = 28) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (<span key={i} style={{ fontSize: `${size}px`, color: i <= Math.round(rating) ? '#FBBF24' : '#D1D5DB' }}>★</span>))}
    </div>
  );

  const getInitials = (name) => { if (!name) return 'U'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };
  const formatDate = (date) => {
    const d = new Date(date); const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today'; if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', animation: 'pulse 1.5s infinite' }}>🎪</div><p style={{ color: '#6B7280', marginTop: '16px' }}>Loading...</p></div></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '60px' }}><div style={{ fontSize: '64px', marginBottom: '20px' }}>🎪</div><h2>Event not found</h2><button onClick={() => router.push('/parent/events')} style={{ padding: '12px 24px', background: '#F5576C', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: '700' }}>← Back</button></div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button onClick={() => router.push('/parent/events')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#F3F4F6', border: 'none', borderRadius: '100px', cursor: 'pointer', color: '#374151', fontWeight: '600', fontSize: '14px', marginBottom: '24px' }}>← Back to Events</button>

      <div style={{ background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', borderRadius: '28px', padding: '40px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', position: 'relative' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>{event.name}</h1>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px' }}>📍 {event.venue?.city}, {event.venue?.state}{event.venue?.fullAddress ? ` • ${event.venue.fullAddress}` : ''}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {event.category && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>{event.category}</span>}
              {event.status && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '700', textTransform: 'capitalize' }}>{event.status}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '24px', fontSize: '14px', flexWrap: 'wrap' }}>
          {event.eventDate && <span>📅 {new Date(event.eventDate).toLocaleDateString('en-IN')}</span>}
          {event.registrationDeadline && <span>⏰ Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-IN')}</span>}
          {event.organizer?.name && <span>👤 {event.organizer.name}</span>}
          {event.organizer?.contact && <span>📞 {event.organizer.contact}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        <div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Share Your Experience</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Help others know what to expect from this event.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowReviewModal(true)} style={{ padding: '14px 36px', background: userReview ? '#10B981' : '#F5576C', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                {userReview ? '✏️ Edit Your Review' : '⭐ Write a Review'}
              </button>
              <button onClick={() => setShowEditModal(true)} style={{ padding: '14px 36px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                📝 Edit Info
              </button>
            </div>
          </div>

          {event.description && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>About this Event</h3>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7 }}>{event.description}</p>
            </div>
          )}

          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Reviews ({event.ratings?.totalReviews || 0})</h3>
          {reviews.length === 0 ? (
            <div style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px', padding: '60px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #F093FB, #F5576C)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px' }}>
                        {getInitials(review.userId?.profile?.firstName + ' ' + review.userId?.profile?.lastName)}
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', color: '#0B0B1A', fontSize: '15px' }}>{review.userId?.profile?.firstName} {review.userId?.profile?.lastName?.[0]}.</span>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>{review.reviewType} • {formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#F5576C' }}>⭐ {review.ratings?.overall?.toFixed(1)}</div>
                  </div>
                  {review.title && <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{review.title}</h4>}
                  {review.comment && <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>{review.comment}</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {ratingCategories.map(cat => (
                      <div key={cat.key} style={{ background: '#F9FAFB', padding: '8px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{cat.emoji} {cat.label}</span>
                        <span style={{ fontWeight: '800', color: '#F5576C', fontSize: '12px' }}>{review.ratings?.[cat.key]?.toFixed(1) || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Event Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {event.fees !== undefined && <div>💰 Fees: {event.fees > 0 ? `₹${event.fees}` : 'Free'}</div>}
              {event.eligibility && <div>🎯 Eligibility: {event.eligibility}</div>}
              {event.prizes && <div>🏆 Prizes: {event.prizes}</div>}
              {event.organizer?.website && <div>🌐 <a href={event.organizer.website} target="_blank" style={{ color: '#F5576C' }}>Organizer Website</a></div>}
            </div>
          </div>

          {event.ratings?.totalReviews > 0 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Rating Breakdown</h3>
              <div style={{ textAlign: 'center', marginBottom: '28px', padding: '24px', background: '#F9FAFB', borderRadius: '16px' }}>
                <div style={{ fontSize: '56px', fontWeight: '900', color: '#0B0B1A' }}>{event.ratings.overall?.toFixed(1) || '—'}</div>
                {renderStars(event.ratings.overall || 0, 24)}
                <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>Based on {event.ratings.totalReviews} reviews</p>
              </div>
              {ratingCategories.map(cat => {
                const rating = event.ratings?.[cat.key] || 0;
                return (
                  <div key={cat.key} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px' }}>{cat.emoji} {cat.label}</span>
                      <span style={{ fontWeight: '700', color: '#F5576C', fontSize: '13px' }}>{rating > 0 ? rating.toFixed(1) : '—'}</span>
                    </div>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ width: `${(rating / 5) * 100}%`, height: '100%', background: rating >= 4 ? '#10B981' : rating >= 3 ? '#F59E0B' : '#EF4444', borderRadius: '100px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #E5E7EB', marginTop: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>📜 Activity History</h3>
            <HistoryPanel entityType="event" entityId={params.id} />
          </div>
        </div>
      </div>

      {showReviewModal && <EventReviewModal event={event} existingReview={userReview} onClose={() => setShowReviewModal(false)} onSubmitted={() => { setShowReviewModal(false); fetchData(); }} />}
      <AddEventModal open={showEditModal} onClose={() => setShowEditModal(false)} onSaved={() => fetchData()} editEvent={event} />
      <style jsx global>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
