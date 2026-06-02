'use client';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import FeaturesHero from '@/components/features/FeaturesHero';
import FeatureShowcase from '@/components/features/FeatureShowcase';
import SectionDivider from '@/components/landing/SectionDivider';

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <FeaturesHero />
        <SectionDivider type="data" />
        <FeatureShowcase />
        <SectionDivider type="marquee" />
        
         {/* Technical Blueprint Section */}
        <section style={{ padding: '120px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
            <span className="section-label">🛠️ Built for Real Impact</span>
            <h2 className="section-title">Numbers Don't <span style={{ color: '#2563EB' }}>Lie</span></h2>
            <p className="section-subtitle">
              Every feature on Kushaagra is tested against real student data, refined through feedback, 
              and proven to work. Here's what we've achieved so far.
            </p>
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
              marginTop: '60px'
            }}>
              {[
                { num: '10,000+', label: 'Opportunities Cataloged', desc: 'Every scholarship, olympiad, and scheme across India' },
                { num: '1.2M', label: 'Students Reached', desc: 'From Kashmir to Kanyakumari — pan-India coverage' },
                { num: '₹500Cr+', label: 'Rewards Mapped', desc: 'Total scholarship value available on the platform' },
                { num: '500+', label: 'Partner Institutions', desc: 'Schools, boards, and government bodies connected' },
                { num: '98.7%', label: 'Match Accuracy', desc: 'AI precision in recommending the right opportunities' },
                { num: '100%', label: 'Free Forever', desc: 'No hidden fees, no premium tiers — completely free' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '36px 28px',
                  background: '#F9FAFB',
                  borderRadius: '24px',
                  border: '1px solid #E5E7EB',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#2563EB'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#2563EB', marginBottom: '8px', letterSpacing: '-1px' }}>{item.num}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0B0B1A', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider type="pulse" />
      </main>
      <Footer />
    </>
  );
}
