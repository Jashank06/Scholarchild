import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CareersHero from '@/components/careers/CareersHero';
import OpenRoles from '@/components/careers/OpenRoles';
import SectionDivider from '@/components/landing/SectionDivider';

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <CareersHero />
        <SectionDivider type="marquee" />
        
        {/* Why Join Us Section */}
        <section style={{ padding: '120px 0', background: '#F9FAFB' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <span className="section-label">💎 Perks & Benefits</span>
              <h2 className="section-title">Beyond just a <span style={{ color: '#2563EB' }}>Job</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏠</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>Remote-First</h3>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Work from anywhere in India. We trust you to manage your time.</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📈</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>Equity Options</h3>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Own a piece of the company. We grow together, we win together.</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧘</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>Wellness Stipend</h3>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Monthly allowance for your physical and mental well-being.</p>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider type="data" />
        <OpenRoles />
        <SectionDivider type="pulse" />

        {/* Closing CTA */}
        <section style={{ padding: '100px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '900', color: '#0B0B1A', marginBottom: '24px' }}>Don't See a Role?</h2>
            <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '40px' }}>
              We're always looking for talented people. Drop us a mail at 
              <span style={{ color: '#2563EB', fontWeight: '700' }}> careers@kushaagra.com</span>
            </p>
            <a href="https://popoal.com/register" target="_blank" rel="noopener noreferrer" style={{ 
              display: 'inline-block',
              padding: '1.2rem 3rem', 
              background: '#0B0B1A', 
              color: 'white', 
              border: 'none', 
              borderRadius: '100px',
              fontWeight: '800',
              textDecoration: 'none',
              cursor: 'pointer'
            }}>Send General Application</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
