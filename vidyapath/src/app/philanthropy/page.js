import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PhilHero from '@/components/philanthropy/PhilHero';
import ImpactMetrics from '@/components/philanthropy/ImpactMetrics';
import SectionDivider from '@/components/landing/SectionDivider';

export default function PhilanthropyPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <PhilHero />
        <SectionDivider type="marquee" />
        <ImpactMetrics />
        <SectionDivider type="data" />
        
        {/* Donation CTA */}
        <section style={{ padding: '120px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#0B0B1A', marginBottom: '24px' }}>Become a Partner in Change</h2>
            <p style={{ fontSize: '20px', color: '#6B7280', marginBottom: '40px' }}>
              We collaborate with CSR wings, NGOs, and individual philanthropists to 
              scale our impact. Let's build a brighter India together.
            </p>
            <button style={{ 
              padding: '1.2rem 3rem', 
              background: '#2563EB', 
              color: 'white', 
              border: 'none', 
              borderRadius: '100px',
              fontWeight: '800'
            }}>Contact for Partnership</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
