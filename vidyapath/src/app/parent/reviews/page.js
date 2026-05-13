'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ParentReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [form, setForm] = useState({
    academics: 5, infrastructure: 5, faculty: 5, extracurricular: 5, safety: 5, comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewRes, schoolRes] = await Promise.all([
        api.getMyReviews(),
        api.getSchools({ limit: 100 }),
      ]);
      setReviews(reviewRes.data || []);
      setSchools(schoolRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const val = e.target.type === 'range' ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchool) { setMessage({ text: 'Please select a school', type: 'error' }); return; }
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.submitReview(selectedSchool, form);
      if (res.success) {
        setMessage({ text: '✅ Review submitted successfully!', type: 'success' });
        setShowForm(false);
        setForm({ academics: 5, infrastructure: 5, faculty: 5, extracurricular: 5, safety: 5, comment: '' });
        setSelectedSchool('');
        loadData();
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to submit review', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = (r) => {
    const vals = [r.academics, r.infrastructure, r.faculty, r.extracurricular, r.safety];
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const RatingSlider = ({ label, name, value, emoji }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{emoji} {label}</label>
        <span style={{
          fontSize: '13px', fontWeight: '900', color: value >= 4 ? '#059669' : value >= 3 ? '#F59E0B' : '#DC2626',
          background: value >= 4 ? '#ECFDF5' : value >= 3 ? '#FFFBEB' : '#FEF2F2',
          padding: '2px 10px', borderRadius: '100px',
        }}>{value}/5</span>
      </div>
      <input type="range" name={name} min="1" max="5" step="1" value={value} onChange={handleChange}
        style={{ width: '100%', accentColor: '#2563EB', height: '6px', cursor: 'pointer' }}
      />
    </div>
  );

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>Loading reviews...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>My Reviews ⭐</h1>
          <p style={{ color: '#6B7280' }}>Rate and review schools based on your experience.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '12px 24px', background: showForm ? '#6B7280' : '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>{showForm ? 'Cancel' : '+ Write Review'}</button>
      </div>

      {message.text && (
        <div style={{
          padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', fontWeight: '700', fontSize: '14px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
          border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
        }}>{message.text}</div>
      )}

      {/* Review Form */}
      {showForm && (
        <div style={{
          background: 'white', border: '1px solid #E5E7EB', borderRadius: '28px',
          padding: '36px', marginBottom: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#0B0B1A' }}>
            📝 Write a School Review
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                Select School
              </label>
              <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} required
                style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', background: '#F9FAFB' }}>
                <option value="">Choose a school...</option>
                {schools.map(s => <option key={s._id} value={s._id}>{s.name} — {s.address?.city}, {s.address?.state}</option>)}
              </select>
            </div>

            <div style={{ background: '#F9FAFB', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0B0B1A', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Rate on 5 Criteria
              </h4>
              <RatingSlider label="Academics" name="academics" value={form.academics} emoji="📚" />
              <RatingSlider label="Infrastructure" name="infrastructure" value={form.infrastructure} emoji="🏗️" />
              <RatingSlider label="Faculty" name="faculty" value={form.faculty} emoji="👨‍🏫" />
              <RatingSlider label="Extracurricular" name="extracurricular" value={form.extracurricular} emoji="🎨" />
              <RatingSlider label="Safety & Environment" name="safety" value={form.safety} emoji="🛡️" />

              <div style={{
                marginTop: '16px', padding: '16px', background: 'white', borderRadius: '14px',
                border: '1px solid #E5E7EB', textAlign: 'center',
              }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#6B7280', marginBottom: '4px' }}>OVERALL SCORE</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#2563EB' }}>
                  ⭐ {avgRating(form)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                Your Review (Optional)
              </label>
              <textarea name="comment" value={form.comment} onChange={handleChange} rows="4"
                placeholder="Share your experience about this school..."
                style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={submitting} style={{
              padding: '14px 36px', background: '#2563EB', color: 'white',
              border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '15px',
            }}>{submitting ? 'Submitting...' : 'Submit Review →'}</button>
          </form>
        </div>
      )}

      {/* My Reviews List */}
      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A', marginBottom: '20px' }}>
        Your Reviews ({reviews.length})
      </h3>

      {reviews.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px',
          padding: '60px', textAlign: 'center', color: '#6B7280',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>You haven't reviewed any schools yet.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Write Review" above to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {reviews.map((review) => (
            <div key={review._id} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px',
              padding: '28px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A' }}>
                    {review.schoolId?.name || 'School'}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    {review.schoolId?.address?.city}, {review.schoolId?.address?.state} • {review.schoolId?.board}
                  </p>
                </div>
                <div style={{
                  fontSize: '16px', fontWeight: '900', color: '#2563EB', background: '#EFF6FF',
                  padding: '6px 14px', borderRadius: '100px',
                }}>⭐ {review.ratings?.overall?.toFixed(1)}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { label: 'Academics', val: review.ratings?.academics },
                  { label: 'Infrastructure', val: review.ratings?.infrastructure },
                  { label: 'Faculty', val: review.ratings?.faculty },
                  { label: 'Extra', val: review.ratings?.extracurricular },
                  { label: 'Safety', val: review.ratings?.safety },
                ].map((r, i) => (
                  <span key={i} style={{
                    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px',
                    background: '#F3F4F6', color: '#374151',
                  }}>{r.label}: {r.val}/5</span>
                ))}
              </div>

              {review.comment && (
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{review.comment}"
                </p>
              )}

              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '12px' }}>
                Reviewed on {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
