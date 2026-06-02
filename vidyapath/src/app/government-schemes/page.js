'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import api from '@/lib/api';

const categoriesList = ['All', 'academic', 'general'];

const demoOpportunities = [
  { _id: 'demo1', title: 'PM Scholarship Scheme', category: 'general', organizer: { name: 'Government of India' }, rewards: { cashAmount: 144000 }, dates: { applicationDeadline: new Date(Date.now() + 60 * 86400000).toISOString() } },
  { _id: 'demo2', title: 'National Means-cum-Merit Scholarship', category: 'academic', organizer: { name: 'Department of School Education' }, rewards: { cashAmount: 72000 }, dates: { applicationDeadline: new Date(Date.now() + 30 * 86400000).toISOString() } },
  { _id: 'demo3', title: 'Central Sector Scheme for College Students', category: 'academic', organizer: { name: 'Ministry of Education' }, rewards: { cashAmount: 180000 }, dates: { applicationDeadline: new Date(Date.now() + 45 * 86400000).toISOString() } },
  { _id: 'demo4', title: 'Pre-Matric Scholarship for Minorities', category: 'general', organizer: { name: 'Ministry of Minority Affairs' }, rewards: { cashAmount: 36000 }, dates: { applicationDeadline: new Date(Date.now() + 75 * 86400000).toISOString() } },
  { _id: 'demo5', title: 'Post-Matric Scholarship for OBC', category: 'general', organizer: { name: 'Department of Social Justice' }, rewards: { cashAmount: 96000 }, dates: { applicationDeadline: new Date(Date.now() + 90 * 86400000).toISOString() } },
  { _id: 'demo6', title: 'Kishore Vaigyanik Protsahan Yojana (KVPY)', category: 'academic', organizer: { name: 'DST, IISc' }, rewards: { cashAmount: 240000 }, dates: { applicationDeadline: new Date(Date.now() + 120 * 86400000).toISOString() } },
];

export default function SchemesLanding() {
  const [opportunities, setOpportunities] = useState(demoOpportunities);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
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
        const params = { type: 'scheme', limit: 12 };
        if (activeCategory !== 'All') params.category = activeCategory;
  const res = await api.getOpportunities(params);
  const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) throw new Error('empty');
        setOpportunities(data);
      } catch (e) {
        const filtered = activeCategory === 'All' ? demoOpportunities : demoOpportunities.filter(o => o.category === activeCategory);
        setOpportunities(filtered);
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
          background: 'linear-gradient(135deg, #0B0B1A 0%, #064E3B 50%, #0B0B1A 100%)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '140px 40px 80px'
        }}>
          <div className="particles-container">
            {particles.map((p, i) => (
              <div key={i} className="particle" style={{
                width: p.w + 'px', height: p.h + 'px',
                background: `rgba(52,211,153,${p.a})`,
                top: p.t + '%', left: p.l + '%',
                animation: `particleFloat${p.idx + 1} ${p.dur}s ease-in-out infinite`,
                animationDelay: p.del + 's',
              }} />
            ))}
          </div>
          <div className="hero-orb hero-orb-1" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent)' }} />
          <div className="hero-orb hero-orb-2" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12), transparent)' }} />
          <div className="hero-orb hero-orb-3" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.08), transparent)' }} />
          <div className="hero-content">
            <div className="hero-text-col">
              <div className="hero-badge" style={{ color: '#6EE7B7', animation: 'fadeInUp 0.8s ease-out' }}>
                🏛️ Government Schemes & Welfare
              </div>
              <h1 className="hero-title" style={{ animation: 'fadeInUp 1s ease-out' }}>
                Your Government,{' '}
                <span style={{ background: 'linear-gradient(135deg, #34D399, #10B981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Your Support
                </span>
              </h1>
              <p className="hero-subtitle" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
                Central and state government welfare schemes, fellowships, and educational aids for students from every background. Apply with confidence.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', animation: 'fadeInUp 1.4s ease-out' }}>
                <a href="/auth" className="btn-premium btn-premium-emerald">Explore Schemes →</a>
                <a href="/auth" className="btn-premium btn-premium-ghost">Browse All</a>
              </div>
              <div className="hero-stats" style={{ animation: 'fadeInUp 1.6s ease-out' }}>
                {[
                  { num: '200+', label: 'Government Schemes' },
                  { num: '36', label: 'States Covered' },
                  { num: '₹500Cr+', label: 'Total Aid' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="hero-stat-number" style={{ color: '#34D399' }}>{s.num}</div>
                    <div className="hero-stat-label" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SectionDivider type="wave" color="emerald" />

        <section className="section-gradient-emerald section-padded" style={{ position: 'relative' }}>
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
          <div className="section-wrapper">
            <div className="section-header-center">
              <span className="section-label">🏛️ Browse Schemes</span>
              <h2 className="section-title">Explore <span className="gradient-text">Government Schemes</span></h2>
              <p className="section-subtitle" style={{ margin: '0 auto' }}>Central & state schemes for every student.</p>
            </div>
            <div className="filter-row">
              {categoriesList.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`premium-pill ${activeCategory === cat ? 'premium-pill-active' : 'premium-pill-inactive'}`}>
                  {cat === 'All' ? 'All Schemes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="bento-3col stagger-children">
              {loading && displayOpportunities.length === 0 ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton-shimmer" />
              )) : displayOpportunities.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>No schemes found in this category.</div>
              ) : displayOpportunities.map(opp => (
                <div key={opp._id} className="premium-card" style={{ padding: '28px', border: '1px solid rgba(16,185,129,0.12)' }}
                  onMouseMove={handleMouseMove}>
                  <div className="premium-card-glow" />
                  <div className="premium-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                    <span>{opp.category || 'General'}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px', lineHeight: '1.3' }}>{opp.title}</h3>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>{opp.organizer?.name}</div>
                  {opp.rewards?.cashAmount > 0 && (
                    <div style={{
                      fontSize: '22px', fontWeight: '900',
                      background: 'linear-gradient(135deg, #059669, #10B981)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      marginBottom: '12px'
                    }}>₹{opp.rewards.cashAmount.toLocaleString('en-IN')}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: opp.rewards?.cashAmount > 0 ? 0 : 'auto' }}>
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
                      <span className="deadline-badge deadline-badge-open">No deadline</span>
                    )}
                    <a href="/auth" style={{
                      padding: '8px 20px', background: 'linear-gradient(135deg, #059669, #10B981)',
                      color: 'white', borderRadius: '100px', fontWeight: '700', fontSize: '12px',
                      textDecoration: 'none', boxShadow: '0 4px 15px rgba(5,150,105,0.3)'
                    }}>
                      View Details →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-wrap">
              <a href="/auth" style={{
                padding: '14px 36px', background: '#059669', color: 'white',
                borderRadius: '100px', fontWeight: '800', fontSize: '15px',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(5,150,105,0.3)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(5,150,105,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(5,150,105,0.3)'; }}>
                View All Schemes →
              </a>
            </div>
          </div>
        </section>

        <SectionDivider type="wave-reverse" color="emerald" />

        <section style={{ padding: '80px 40px', background: 'white', position: 'relative' }}>
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)' }} />
          <div className="section-wrapper">
            <div className="section-header-center">
              <span className="section-label">⚡ Simple Process</span>
              <h2 className="section-title">How to <span className="gradient-text">Apply</span></h2>
            </div>
            <div className="bento-3col stagger-children" style={{ position: 'relative' }}>
              {[
                { step: '01', icon: '🔍', title: 'Find Your Scheme', desc: 'Browse by state, category, or income criteria. Our AI finds the best matches for you.' },
                { step: '02', icon: '📄', title: 'Check Eligibility', desc: 'View eligibility criteria, required documents, and application deadlines at a glance.' },
                { step: '03', icon: '✅', title: 'Apply Online', desc: 'Apply directly through the official portal link. Track your application status.' },
              ].map((item, i) => (
                <div key={i} className="step-card steps-connector" style={{ border: '1px solid rgba(16,185,129,0.12)' }}>
                  <div className="step-number" style={{ background: '#ECFDF5', color: '#059669' }}>{item.step}</div>
                  <div className="step-icon-wrap" style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}>
                    <div className="step-icon-glow" style={{ background: 'linear-gradient(135deg, #34D399, #059669)' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{item.icon}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider type="wave" color="emerald" />

        <section className="cta-gradient cta-section">
          <div className="cta-orb" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent)', top: '-20%', right: '-10%' }} />
          <div className="cta-orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(52,211,153,0.08), transparent)', bottom: '-20%', left: '-10%' }} />
          <div className="cta-wrapper">
            <h2 className="cta-title">Don&apos;t Miss Out on Government Support</h2>
            <p className="cta-subtitle">Thousands of crores in educational aid go unclaimed every year. Let us help you find what you&apos;re eligible for.</p>
            <div className="cta-buttons">
              <a href="/auth" className="btn-premium btn-premium-emerald">Get Started Free →</a>
              <a href="/auth" className="btn-premium btn-premium-ghost">Browse All Schemes</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
