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
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
            <span className="section-label">🛠️ Technical Blueprint</span>
            <h2 className="section-title">Built for <span style={{ color: '#2563EB' }}>Scale</span></h2>
            <p className="section-subtitle">
              VidyaPath is built on a foundation of security, speed, and reliability. 
              Our infrastructure is designed to handle millions of concurrent applications 
              without a single second of downtime.
            </p>
            <div style={{ 
              marginTop: '60px', 
              padding: '60px', 
              background: '#0B0B1A', 
              borderRadius: '60px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                opacity: 0.1, 
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
                backgroundSize: '40px 40px' 
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '20px' }}>99.9% Uptime SLA</h3>
                <p style={{ opacity: 0.7, fontSize: '18px' }}>Enterprise-grade infrastructure powered by the cloud.</p>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider type="pulse" />
      </main>
      <Footer />
    </>
  );
}
