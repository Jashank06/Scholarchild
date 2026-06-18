'use client';

import { useState } from 'react';
import api from '@/lib/api';

const ratingCategories = [
  { key: 'experience', label: 'Experience', emoji: '⭐' },
  { key: 'organization', label: 'Organization', emoji: '📋' },
  { key: 'value', label: 'Value', emoji: '💰' },
  { key: 'engagement', label: 'Engagement', emoji: '🎯' },
];

export default function EventReviewModal({ event, existingReview, onClose, onSubmitted }) {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState(existingReview?.ratings || {});
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [pros, setPros] = useState(existingReview?.pros || []);
  const [cons, setCons] = useState(existingReview?.cons || []);
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const allRated = ratingCategories.every(c => ratings[c.key] >= 1);

  const handleSubmit = async () => {
    if (!allRated) { setError('Please rate all categories'); return; }
    setSubmitting(true);
    setError('');
    try {
      if (existingReview) {
        await api.updateEventReview(event._id, { ratings, title, comment, pros, cons });
      } else {
        await api.submitEventReview(event._id, { ratings, title, comment, pros, cons });
      }
      onSubmitted?.();
    } catch (e) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const addPro = () => { if (prosInput.trim()) { setPros([...pros, prosInput.trim()]); setProsInput(''); } };
  const addCon = () => { if (consInput.trim()) { setCons([...cons, consInput.trim()]); setConsInput(''); } };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: '24px',
        width: '100%', maxWidth: '560px', maxHeight: '92vh',
        overflow: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{existingReview ? '✏️ Edit Review' : '⭐ Review Event'}</h2>
          <p style={{ fontSize: '13px', opacity: 0.85, margin: '4px 0 0' }}>{event?.name}</p>
        </div>

        <div style={{ padding: '24px' }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>{error}</div>}

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Rate the event</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ratingCategories.map(cat => (
                  <div key={cat.key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', background: '#F9FAFB', borderRadius: '14px',
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{cat.emoji} {cat.label}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1,2,3,4,5].map(i => (
                        <button key={i} onClick={() => setRatings({ ...ratings, [cat.key]: i })} style={{
                          width: '34px', height: '34px', borderRadius: '50%', border: 'none',
                          background: i <= (ratings[cat.key] || 0) ? '#FBBF24' : '#E5E7EB',
                          cursor: 'pointer', fontSize: '16px', color: i <= (ratings[cat.key] || 0) ? '#fff' : '#9CA3AF',
                          fontWeight: '700',
                        }}>{i}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { if (allRated) setStep(2); else setError('Please rate all categories'); }} style={{
                width: '100%', padding: '14px', marginTop: '24px', background: allRated ? '#F5576C' : '#E5E7EB',
                color: allRated ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '12px',
                fontWeight: '800', cursor: allRated ? 'pointer' : 'default', fontSize: '15px',
              }}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Write your review</h3>
              <label style={{ display: 'block', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Title</span>
                <input type="text" placeholder="Summarize your experience" value={title} onChange={(e) => setTitle(e.target.value)} style={inp} maxLength={100} />
              </label>
              <label style={{ display: 'block', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Your Review</span>
                <textarea placeholder="Share your experience of this event..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ ...inp, minHeight: '90px', resize: 'vertical' }} maxLength={1500} />
              </label>
              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Highlights</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="What went well?" value={prosInput} onChange={(e) => setProsInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPro(); } }} style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={addPro} style={{ padding: '10px 16px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>+</button>
                </div>
                {pros.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>{pros.map((p, i) => (
                  <span key={i} style={{ padding: '4px 12px', background: '#ECFDF5', color: '#065F46', borderRadius: '100px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setPros(pros.filter((_, j) => j !== i))}>{p} ✕</span>
                ))}</div>}
              </label>
              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Areas to Improve</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="What could be better?" value={consInput} onChange={(e) => setConsInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCon(); } }} style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={addCon} style={{ padding: '10px 16px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>+</button>
                </div>
                {cons.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>{cons.map((c, i) => (
                  <span key={i} style={{ padding: '4px 12px', background: '#FEF2F2', color: '#991B1B', borderRadius: '100px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setCons(cons.filter((_, j) => j !== i))}>{c} ✕</span>
                ))}</div>}
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', color: '#6B7280', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: '#F5576C', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Review →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Confirm your review</h3>
              <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {ratingCategories.map(cat => (
                    <div key={cat.key} style={{ textAlign: 'center', padding: '8px', background: '#fff', borderRadius: '10px' }}>
                      <div style={{ fontSize: '18px' }}>{'★'.repeat(ratings[cat.key] || 0)}{'☆'.repeat(5 - (ratings[cat.key] || 0))}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{cat.label}</div>
                    </div>
                  ))}
                </div>
                {title && <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>{title}</p>}
                {comment && <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.6 }}>{comment}</p>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', color: '#6B7280', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={submitting} style={{
                  flex: 1, padding: '14px',
                  background: submitting ? '#F9A8D4' : '#F5576C',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontWeight: '800', cursor: submitting ? 'default' : 'pointer', fontSize: '15px',
                }}>{submitting ? 'Submitting...' : '✅ Submit Review'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inp = { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
