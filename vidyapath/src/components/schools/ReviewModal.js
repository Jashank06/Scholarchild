'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import api from '@/lib/api';

const allPros = [
  'Excellent teachers', 'Clean campus', 'Good infrastructure', 'Safe environment',
  'Friendly staff', 'Quality education', 'Modern facilities', 'Great extracurriculars',
  'Strong academics', 'Helpful administration', 'Good sports facilities', 'Well-maintained',
  'Caring teachers', 'Great curriculum', 'Active parents community', 'Good hygiene',
  'Strong discipline', 'Regular updates', 'Interactive classes', 'Good labs',
];

const allCons = [
  'High fees', 'Limited parking', 'Crowded classrooms', 'Poor communication',
  'Outdated facilities', 'Weak sports', 'Insufficient teachers', 'Far from home',
  'Food quality', 'Transport issues', 'Limited activities', 'Slow responses',
  'Inadequate security', 'Poor maintenance', 'Rigid rules', 'Less personal attention',
];

const headlineSuggestions = [
  'Great school with caring teachers',
  'Excellent academics but needs better sports',
  'Safe environment for children',
  'Good infrastructure and facilities',
  'Quality education at affordable fees',
  'Experienced and supportive faculty',
  'Modern campus with great labs',
  'Strong focus on overall development',
  'Clean and well-maintained premises',
  'Good communication with parents',
];

const reviewSuggestions = [
  'My child loves going to school every day. The teachers are very supportive and the curriculum is well-designed.',
  'Overall a great experience. The school maintains high standards of education and safety.',
  'Very happy with the progress my child has shown. The extracurricular activities are excellent.',
  'The faculty is experienced and the management is responsive to parent concerns.',
  'Excellent infrastructure with well-equipped labs and sports facilities.',
  'Good academic focus with regular assessments. Teachers are approachable and helpful.',
  'The school organizes great events and keeps parents informed about their child\'s progress.',
  'A reliable choice for quality education. The campus is clean and secure.',
  'Friendly environment with good peer group. My child has improved significantly.',
  'Professional staff and good teaching methodology. Recommend to other parents.',
];

// Get random suggestions each time
const getRandomSuggestions = (arr, count = 5) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const ratingCategories = [
  { key: 'academics', label: 'Academics', emoji: '📚', desc: 'Quality of education, curriculum, exams', color: '#6366F1' },
  { key: 'infrastructure', label: 'Infrastructure', emoji: '🏗️', desc: 'Building, labs, sports facilities', color: '#8B5CF6' },
  { key: 'faculty', label: 'Faculty & Teachers', emoji: '👨‍🏫', desc: 'Teacher quality, engagement, support', color: '#EC4899' },
  { key: 'extracurricular', label: 'Extracurricular', emoji: '🎨', desc: 'Sports, arts, activities, clubs', color: '#F59E0B' },
  { key: 'safety', label: 'Safety & Environment', emoji: '🛡️', desc: 'Security, hygiene, environment', color: '#10B981' },
  { key: 'communication', label: 'Communication', emoji: '📢', desc: 'Parent-teacher communication', color: '#06B6D4' },
  { key: 'valueForMoney', label: 'Value for Money', emoji: '💰', desc: 'Fees vs quality of education', color: '#EF4444' },
];

const starEmojis = ['😞', '😕', '😐', '🙂', '😄'];
const starLabels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function ReviewModal({ school, existingReview, onClose, onSubmitted }) {
  const [step, setStep] = useState(existingReview ? 2 : 1);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [form, setForm] = useState({
    academics: existingReview?.ratings?.academics || 3,
    infrastructure: existingReview?.ratings?.infrastructure || 3,
    faculty: existingReview?.ratings?.faculty || 3,
    extracurricular: existingReview?.ratings?.extracurricular || 3,
    safety: existingReview?.ratings?.safety || 3,
    communication: existingReview?.ratings?.communication || 3,
    valueForMoney: existingReview?.ratings?.valueForMoney || 3,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    pros: existingReview?.pros?.join('\n') || '',
    cons: existingReview?.cons?.join('\n') || '',
    visitDate: existingReview?.visitDate ? existingReview.visitDate.split('T')[0] : '',
    childGrade: existingReview?.childGrade || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Random suggestions that change on each render
  const [suggestedPros] = useState(() => getRandomSuggestions(allPros, 5));
  const [suggestedCons] = useState(() => getRandomSuggestions(allCons, 5));
  const [suggestedHeadlines] = useState(() => getRandomSuggestions(headlineSuggestions, 4));
  const [suggestedReviews] = useState(() => getRandomSuggestions(reviewSuggestions, 3));
  
  const addSuggestion = (type, text) => {
    if (type === 'pros') {
      const current = form.pros.trim();
      const newText = current ? `${current}\n${text}` : text;
      setForm({ ...form, pros: newText });
    } else if (type === 'cons') {
      const current = form.cons.trim();
      const newText = current ? `${current}\n${text}` : text;
      setForm({ ...form, cons: newText });
    } else if (type === 'title') {
      setForm({ ...form, title: text });
    } else if (type === 'comment') {
      setForm({ ...form, comment: text });
    }
  };
  
  const contentRef = useRef(null);
  
  const handleRatingChange = useCallback((key, value) => {
    const scrollTop = contentRef.current?.scrollTop || 0;
    setForm(prev => ({ ...prev, [key]: value }));
    requestAnimationFrame(() => {
      if (contentRef.current) contentRef.current.scrollTop = scrollTop;
    });
  }, []);

  const avgRating = () => {
    return ((form.academics + form.infrastructure + form.faculty + form.extracurricular + form.safety + form.communication + form.valueForMoney) / 7).toFixed(1);
  };

  const getRatingColor = (value) => {
    if (value >= 5) return '#10B981';
    if (value >= 4) return '#22C55E';
    if (value >= 3) return '#F59E0B';
    if (value >= 2) return '#F97316';
    return '#EF4444';
  };

  const getRatingGradient = (value) => {
    if (value >= 4) return 'linear-gradient(135deg, #10B981, #22C55E)';
    if (value >= 3) return 'linear-gradient(135deg, #F59E0B, #FBBF24)';
    return 'linear-gradient(135deg, #EF4444, #F87171)';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        academics: form.academics,
        infrastructure: form.infrastructure,
        faculty: form.faculty,
        extracurricular: form.extracurricular,
        safety: form.safety,
        communication: form.communication,
        valueForMoney: form.valueForMoney,
        title: form.title,
        comment: form.comment,
        pros: form.pros.split('\n').filter(p => p.trim()),
        cons: form.cons.split('\n').filter(c => c.trim()),
        visitDate: form.visitDate || undefined,
        childGrade: form.childGrade ? parseInt(form.childGrade, 10) : undefined,
      };
      
      if (existingReview) {
        await api.request(`/schools/${school._id}/review`, { 
          method: 'PUT', 
          body: JSON.stringify(payload) 
        });
      } else {
        await api.submitReview(school._id, payload);
      }
      
      onSubmitted();
    } catch (e) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Advanced Rating Card with animations
  const RatingCard = ({ category, index }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const value = form[category.key];
    const displayValue = hoveredRating !== null && activeCategory === category.key ? hoveredRating : value;
    const ratingColor = getRatingColor(displayValue);
    
    return (
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: activeCategory === category.key 
            ? `0 20px 60px ${category.color}30, 0 0 40px ${category.color}20, inset 0 1px 0 rgba(255,255,255,1)`
            : '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          transform: activeCategory === category.key ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={() => { setActiveCategory(category.key); setIsRevealed(true); }}
        onMouseLeave={() => { setActiveCategory(null); }}
      >
        {/* Animated Background Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: getRatingGradient(displayValue),
          transition: 'all 0.3s ease',
        }} />
        
        {/* Floating Particles Effect */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle, ${category.color}15 0%, transparent 70%)`,
          borderRadius: '50%',
          animation: 'float 3s ease-in-out infinite',
        }} />
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              boxShadow: `0 8px 24px ${category.color}25`,
              transition: 'transform 0.3s ease',
              transform: activeCategory === category.key ? 'rotate(-8deg) scale(1.1)' : 'rotate(0) scale(1)',
            }}>
              {category.emoji}
            </div>
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '800', 
                color: '#1F2937',
                margin: 0,
              }}>{category.label}</h3>
              <p style={{ 
                fontSize: '12px', 
                color: '#9CA3AF', 
                margin: '4px 0 0 0',
              }}>{category.desc}</p>
            </div>
          </div>
          
          {/* Rating Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: ratingColor,
            padding: '10px 16px',
            borderRadius: '16px',
            boxShadow: `0 8px 24px ${ratingColor}40`,
            transform: activeCategory === category.key ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            <span style={{ fontSize: '28px' }}>{starEmojis[displayValue - 1]}</span>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '800', 
              color: 'white',
              marginTop: '2px',
            }}>{displayValue}/5</span>
          </div>
        </div>
        
        {/* Rating Stars */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          {[1, 2, 3, 4, 5].map((i) => {
            const isSelected = i <= displayValue;
            const isHovered = hoveredRating !== null && i <= hoveredRating && activeCategory === category.key;
            
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRatingChange(category.key, i);
                }}
                onMouseEnter={() => { setHoveredRating(i); setActiveCategory(category.key); }}
                onMouseLeave={() => { setHoveredRating(null); }}
                style={{
                  width: '56px',
                  height: '56px',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected 
                    ? i >= 4 
                      ? 'linear-gradient(135deg, #10B981, #22C55E)'
                      : i >= 3 
                        ? 'linear-gradient(135deg, #F59E0B, #FBBF24)'
                        : 'linear-gradient(135deg, #EF4444, #F87171)'
                    : isHovered 
                      ? 'rgba(107, 114, 128, 0.2)'
                      : 'rgba(229, 231, 235, 0.5)',
                  transform: isSelected 
                    ? i === displayValue 
                      ? activeCategory === category.key 
                        ? 'translateY(-8px) scale(1.15)' 
                        : 'translateY(-4px) scale(1.08)'
                      : 'scale(1)'
                    : isHovered 
                      ? 'scale(1.05)'
                      : 'scale(1)',
                  boxShadow: isSelected 
                    ? `0 12px 32px ${ratingColor}50` 
                    : isHovered 
                      ? '0 4px 16px rgba(0,0,0,0.1)'
                      : 'none',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  opacity: isSelected || isHovered ? 1 : 0.6,
                }}
              >
                {starEmojis[i - 1]}
              </button>
            );
          })}
        </div>
        
        {/* Rating Label */}
        <div style={{
          textAlign: 'center',
          padding: '10px 16px',
          borderRadius: '12px',
          background: activeCategory === category.key 
            ? getRatingGradient(displayValue)
            : '#F3F4F6',
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '700',
            color: activeCategory === category.key ? 'white' : '#6B7280',
            transition: 'color 0.3s ease',
          }}>
            {starLabels[displayValue - 1]}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 1000, padding: '20px',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div 
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
            borderRadius: '32px',
            width: '100%', maxWidth: '680px',
            maxHeight: '92vh',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '28px 32px',
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative Elements */}
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '120px', height: '120px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(20px)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-20px', left: '80px',
              width: '80px', height: '80px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '26px', 
                  fontWeight: '900', 
                  color: 'white',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}>
                  {existingReview ? '✏️ Edit Review' : '⭐ Write Review'}
                </h2>
                <p style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255,255,255,0.8)', 
                  margin: '6px 0 0 0',
                }}>{school.name}</p>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                style={{
                  width: '44px', height: '44px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >✕</button>
            </div>

            {/* Step Indicator */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginTop: '24px',
            }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '100px',
                  background: step >= s 
                    ? 'rgba(255,255,255,0.9)' 
                    : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  boxShadow: step >= s ? '0 2px 10px rgba(255,255,255,0.3)' : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={contentRef}
            style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '28px 32px 32px',
              background: '#F9FAFB',
            }}
          >
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #FEE2E2, #FEF2F2)',
                color: '#DC2626',
                padding: '14px 18px',
                borderRadius: '16px',
                marginBottom: '20px',
                fontWeight: '700',
                fontSize: '14px',
                border: '1px solid #FECACA',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
              }}>{error}</div>
            )}

            {step === 1 && (
              <>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '28px',
                }}>
                  <h3 style={{ 
                    fontSize: '22px', 
                    fontWeight: '800', 
                    color: '#1F2937',
                    margin: 0,
                  }}>
                    How would you rate this school?
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6B7280', 
                    margin: '8px 0 0 0',
                  }}>
                    Tap on the faces to rate each aspect
                  </p>
                </div>

                {/* Rating Cards */}
                {ratingCategories.map((cat, index) => (
                  <RatingCard key={cat.key} category={cat} index={index} />
                ))}

                {/* Overall Score Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  borderRadius: '28px',
                  padding: '32px',
                  color: 'white',
                  textAlign: 'center',
                  marginTop: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
                }}>
                  {/* Animated Background */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    animation: 'pulse 4s ease-in-out infinite',
                  }} />
                  
                  <div style={{ 
                    fontSize: '12px', 
                    opacity: 0.8,
                    fontWeight: '600',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    position: 'relative',
                  }}>Your Overall Score</div>
                  
                  <div style={{ 
                    fontSize: '72px', 
                    fontWeight: '900',
                    margin: '8px 0',
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    position: 'relative',
                  }}>⭐ {avgRating()}</div>
                  
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    opacity: 0.9,
                    position: 'relative',
                  }}>
                    {avgRating() >= 4 ? '🌟 Excellent!' : avgRating() >= 3 ? '👍 Good Experience' : '💪 Needs Improvement'}
                  </div>
                  
                  {/* Progress Ring */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    margin: '20px auto 0',
                    position: 'relative',
                  }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeDasharray={`${(avgRating() / 5) * 283} 283`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    </svg>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'linear-gradient(135deg, #667EEA, #764BA2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '18px',
                    fontWeight: '800',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginTop: '24px',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '800', 
                    color: '#1F2937',
                    margin: 0,
                  }}>Tell us more about your experience</h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6B7280', 
                    margin: '6px 0 0 0',
                  }}>Your detailed review helps other parents make informed decisions</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '6px',
                  }}>📝 Headline <span style={{ fontSize: '10px', fontWeight: '400', color: '#9CA3AF' }}>(tap to use)</span></label>
                  
                  {/* Headline Suggestions */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px',
                    marginBottom: '8px',
                  }}>
                    {suggestedHeadlines.map((h, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addSuggestion('title', h)}
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                          border: '1px solid #C7D2FE',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#4F46E5',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Or write your own headline..."
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '6px',
                  }}>📖 Your Review <span style={{ fontSize: '10px', fontWeight: '400', color: '#9CA3AF' }}>(tap to use)</span></label>
                  
                  {/* Review Suggestions */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px',
                    marginBottom: '8px',
                  }}>
                    {suggestedReviews.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addSuggestion('comment', r)}
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                          border: '1px solid #FCD34D',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#B45309',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        📝 {r.substring(0, 40)}...
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Or write your own experience..."
                    rows={4}
                    maxLength={1500}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#9CA3AF', 
                    textAlign: 'right', 
                    marginTop: '6px',
                  }}>{form.comment.length}/1500</p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px', 
                  marginBottom: '16px',
                }}>
                  <div>
                    <label style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      color: '#059669', 
                      display: 'block', 
                      marginBottom: '6px',
                    }}>👍 Pros <span style={{ fontSize: '10px', fontWeight: '400', color: '#9CA3AF' }}>(tap to add)</span></label>
                    
                    {/* Suggestion Chips */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '6px',
                      marginBottom: '8px',
                    }}>
                      {suggestedPros.map((pro, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addSuggestion('pros', pro)}
                          style={{
                            padding: '6px 10px',
                            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                            border: '1px solid #A7F3D0',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#059669',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontSize: '10px' }}>+</span> {pro}
                        </button>
                      ))}
                    </div>
                    
                    <textarea
                      value={form.pros}
                      onChange={(e) => setForm({ ...form, pros: e.target.value })}
                      placeholder="Tap suggestions above or add your own..."
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #D1FAE5',
                        borderRadius: '12px',
                        fontSize: '12px',
                        outline: 'none',
                        resize: 'vertical',
                        background: '#ECFDF5',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10B981'}
                      onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      color: '#DC2626', 
                      display: 'block', 
                      marginBottom: '6px',
                    }}>👎 Cons <span style={{ fontSize: '10px', fontWeight: '400', color: '#9CA3AF' }}>(tap to add)</span></label>
                    
                    {/* Suggestion Chips */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '6px',
                      marginBottom: '8px',
                    }}>
                      {suggestedCons.map((con, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addSuggestion('cons', con)}
                          style={{
                            padding: '6px 10px',
                            background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                            border: '1px solid #FECACA',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#DC2626',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontSize: '10px' }}>+</span> {con}
                        </button>
                      ))}
                    </div>
                    
                    <textarea
                      value={form.cons}
                      onChange={(e) => setForm({ ...form, cons: e.target.value })}
                      placeholder="Tap suggestions above or add your own..."
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #FEE2E2',
                        borderRadius: '12px',
                        fontSize: '12px',
                        outline: 'none',
                        resize: 'vertical',
                        background: '#FEF2F2',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                      onBlur={(e) => e.target.style.borderColor = '#FEE2E2'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#F3F4F6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '100px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >← Back</button>
                  <button 
                    type="button"
                    onClick={() => setStep(3)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#667EEA',
                      color: 'white',
                      border: 'none',
                      borderRadius: '100px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >Continue →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '800', 
                    color: '#1F2937',
                    margin: 0,
                  }}>Almost done!</h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6B7280', 
                    margin: '6px 0 0 0',
                  }}>Add a few more details to make your review more helpful</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px',
                  }}>📅 When did you visit? (Optional)</label>
                  <input
                    type="date"
                    value={form.visitDate}
                    onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '14px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px',
                  }}>👧 Child's Grade (Optional)</label>
                  <select
                    value={form.childGrade}
                    onChange={(e) => setForm({ ...form, childGrade: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '14px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select grade...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>

                

                {/* Summary Card */}
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '2px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#6B7280',
                      fontWeight: '600',
                    }}>Overall Rating</span>
                    <div style={{ 
                      fontSize: '48px', 
                      fontWeight: '900', 
                      color: '#667EEA',
                      lineHeight: 1.2,
                    }}>⭐ {avgRating()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#F3F4F6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '100px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >← Back</button>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      flex: 2,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #667EEA, #764BA2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '100px',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}