'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import api from '@/lib/api';

const categoriesList = ['All', 'academic', 'science', 'arts', 'coding', 'quiz'];

const demoOpportunities = [
  { _id: 'demo1', title: 'National Coding Championship', category: 'coding', organizer: { name: 'Tech Foundation India' }, rewards: { cashAmount: 200000 }, dates: { applicationDeadline: new Date(Date.now() + 60 * 86400000).toISOString() } },
  { _id: 'demo2', title: 'Science Quiz Challenge', category: 'quiz', organizer: { name: 'Vigyan Prasar' }, rewards: { cashAmount: 50000 }, dates: { applicationDeadline: new Date(Date.now() + 25 * 86400000).toISOString() } },
  { _id: 'demo3', title: 'Inter-School Academic Competition', category: 'academic', organizer: { name: 'CBSE' }, rewards: { cashAmount: 75000 }, dates: { applicationDeadline: new Date(Date.now() + 90 * 86400000).toISOString() } },
  { _id: 'demo4', title: 'Young Scientists Expo', category: 'science', organizer: { name: 'DST India' }, rewards: { description: 'Research Grant + ₹1,00,000' }, dates: { applicationDeadline: new Date(Date.now() + 45 * 86400000).toISOString() } },
  { _id: 'demo5', title: 'Creative Arts Competition', category: 'arts', organizer: { name: 'National Gallery of Modern Art' }, rewards: { cashAmount: 30000 }, dates: { applicationDeadline: new Date(Date.now() + 35 * 86400000).toISOString() } },
  { _id: 'demo6', title: 'Hackathon India', category: 'coding', organizer: { name: 'Startup India' }, rewards: { cashAmount: 500000 }, dates: { applicationDeadline: new Date(Date.now() + 15 * 86400000).toISOString() } },
];

export default function CompetitionsLanding() {
  const [opportunities, setOpportunities] = useState(demoOpportunities);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [counts, setCounts] = useState({ total: 0, olympiad: 0, prize: 0 });
  const [particles, setParticles] = useState([]);
  const displayOpportunities = opportunities.length ? opportunities : demoOpportunities;

  useEffect(() => {
    setParticles([...Array(15)].map(() => ({
      w: Math.random() * 6 + 2, h: Math.random() * 6 + 2,
      a: Math.random() * 0.4 + 0.1, t: Math.random() * 100,
      l: Math.random() * 100, dur: Math.random() * 10 + 8,
      del: Math.random() * 5, idx: Math.floor(Math.random() * 2)
    })));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { type: 'competition', limit: 12 };
        if (activeCategory !== 'All') params.category = activeCategory;
  const res = await api.getOpportunities(params);
  const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) throw new Error('empty');
        setOpportunities(data);
        if (res.pagination) setCounts(prev => ({ ...prev, total: res.pagination.total }));
      } catch (e) {
        const filtered = activeCategory === 'All' ? demoOpportunities : demoOpportunities.filter(o => o.category === activeCategory);
        setOpportunities(filtered);
        setCounts(prev => ({ ...prev, total: 5000 }));
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, [activeCategory]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <>
      <Navbar />
      <main>
        <section style={{
          position: 'relative', minHeight: '85vh',
          background: 'linear-gradient(135deg, #0B0B1A 0%, #2d1b69 50%, #0B0B1A 100%)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '140px 40px 80px'
        }}>
          <div className="particles-container">
            {particles.map((p, i) => (
              <div key={i} className="particle" style={{
                width: p.w + 'px', height: p.h + 'px',
                background: `rgba(167,139,250,${p.a})`,
                top: p.t + '%', left: p.l + '%',
                animation: `particleFloat${p.idx + 1} ${p.dur}s ease-in-out infinite`,
                animationDelay: p.del + 's',
              }} />
            ))}
          </div>
          <div className="hero-orb hero-orb-1" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent)' }} />
          <div className="hero-orb hero-orb-2" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12), transparent)' }} />
          <div className="hero-orb hero-orb-3" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent)' }} />
          <div className="hero-content">
            <div className="hero-text-col">
              <div className="hero-badge" style={{ color: '#C4B5FD', animation: 'fadeInUp 0.8s ease-out' }}>
                🏆 Compete & Win Big
              </div>
              <h1 className="hero-title" style={{ animation: 'fadeInUp 1s ease-out' }}>
                Compete,{' '}
                <span style={{ background: 'linear-gradient(135deg, #A78BFA, #8B5CF6, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Win, Shine
                </span>
              </h1>
              <p className="hero-subtitle" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
                Olympiads, quizzes, coding challenges, science fairs, and art contests — find competitions that match your talents and win exciting prizes.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', animation: 'fadeInUp 1.4s ease-out' }}>
                <a href="/auth" className="btn-premium btn-premium-violet">Explore Competitions →</a>
                <a href="/auth" className="btn-premium btn-premium-ghost">Browse All</a>
              </div>
              <div className="hero-stats" style={{ animation: 'fadeInUp 1.6s ease-out' }}>
                {[
                  { num: `${(counts.total || 3000).toLocaleString()}+`, label: 'Total Competitions' },
                  { num: '50+', label: 'Olympiads' },
                  { num: '₹5Cr+', label: 'Prize Pool' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="hero-stat-number" style={{ color: '#A78BFA' }}>{s.num}</div>
                    <div className="hero-stat-label" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SectionDivider type="wave" color="purple" />

        <section className="section-gradient-purple section-padded" style={{ position: 'relative' }}>
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
          <div className="section-wrapper">
            <div className="section-header-center">
              <span className="section-label">🏆 Browse Categories</span>
              <h2 className="section-title">Explore <span className="gradient-text">Competitions</span></h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>From olympiads to hackathons — find your arena.</p>
            </div>
            <div className="filter-row">
              {categoriesList.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`premium-pill ${activeCategory === cat ? 'premium-pill-active' : 'premium-pill-inactive'}`}>
                  {cat === 'All' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="bento-3col stagger-children">
              {loading && displayOpportunities.length === 0 ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton-shimmer" />
              )) : displayOpportunities.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>No competitions found in this category.</div>
              ) : displayOpportunities.map(opp => (
                <div key={opp._id} className="premium-card" style={{ padding: '28px', border: '1px solid rgba(139,92,246,0.12)' }}
                  onMouseMove={handleMouseMove}>
                  <div className="premium-card-glow" />
                  <div className="premium-badge" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                    <span>{opp.category || 'General'}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px', lineHeight: '1.3' }}>{opp.title}</h3>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>{opp.organizer?.name}</div>
                  <div style={{
                    fontSize: '14px', fontWeight: '700', marginBottom: '12px',
                    background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>{opp.rewards?.description || (opp.rewards?.cashAmount > 0 ? `₹${opp.rewards.cashAmount.toLocaleString('en-IN')}` : 'Exciting Prizes')}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    {opp.dates?.applicationDeadline ? (
                      (() => {
                        const days = Math.ceil((new Date(opp.dates.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                          <span className={`deadline-badge ${days <= 7 ? 'deadline-badge-urgent' : days <= 30 ? 'deadline-badge-soon' : 'deadline-badge-open'}`}>
                            {days <= 7 ? '🔥 ' : '⏰ '}{days} days left
                          </span>
                        );
                      })()
                    ) : (
                      <span className="deadline-badge deadline-badge-open">Open</span>
                    )}
                    <a href="/auth" style={{
                      padding: '8px 20px', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                      color: 'white', borderRadius: '100px', fontWeight: '700', fontSize: '12px',
                      textDecoration: 'none', boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
                    }}>
                      View Details →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-wrap">
              <a href="/auth" style={{
                padding: '14px 36px', background: '#7C3AED', color: 'white',
                borderRadius: '100px', fontWeight: '800', fontSize: '15px',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.3)'; }}>
                View All Competitions →
              </a>
            </div>
          </div>
        </section>

        <SectionDivider type="wave-reverse" color="purple" />

        <section style={{ padding: '80px 40px', background: 'white', position: 'relative' }}>
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)' }} />
          <div className="section-wrapper">
            <div className="section-header-center">
              <span className="section-label">⚡ How It Works</span>
              <h2 className="section-title">Your Path to <span className="gradient-text">Victory</span></h2>
            </div>
            <div className="bento-3col stagger-children" style={{ position: 'relative' }}>
              {[
                { step: '01', icon: '📋', title: 'Find Your Event', desc: 'Browse competitions by category, grade, or interest. Filter by olympiads, quizzes, coding, arts & more.' },
                { step: '02', icon: '📝', title: 'Register & Prepare', desc: 'Register in one click. Access syllabus, previous papers, and preparation resources.' },
                { step: '03', icon: '🏆', title: 'Compete & Win', desc: 'Participate, track results, earn certificates, and win exciting prizes and recognition.' },
              ].map((item, i) => (
                <div key={i} className="step-card steps-connector" style={{ border: '1px solid rgba(139,92,246,0.12)' }}>
                  <div className="step-number" style={{ background: '#F5F3FF', color: '#7C3AED' }}>{item.step}</div>
                  <div className="step-icon-wrap" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' }}>
                    <div className="step-icon-glow" style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{item.icon}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider type="wave" color="purple" />

        <section className="cta-gradient cta-section">
          <div className="cta-orb" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent)', top: '-20%', right: '-10%' }} />
          <div className="cta-orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent)', bottom: '-20%', left: '-10%' }} />
          <div className="cta-wrapper">
            <h2 className="cta-title">Ready to Compete?</h2>
            <p className="cta-subtitle">Join millions of students showcasing their talents on national and international stages.</p>
            <div className="cta-buttons">
              <a href="/auth" className="btn-premium btn-premium-violet">Get Started Free →</a>
              <a href="/auth" className="btn-premium btn-premium-ghost">Browse All</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
