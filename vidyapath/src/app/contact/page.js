import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import SectionDivider from '@/components/landing/SectionDivider';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <ContactHero />
        <SectionDivider type="icons" />
        <ContactForm />
        <SectionDivider type="pulse" />
        
        {/* Support Hours Strip */}
        <section style={{ padding: '60px 0', background: '#F9FAFB' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: '900', 
              color: '#9CA3AF', 
              letterSpacing: '2px', 
              textTransform: 'uppercase' 
            }}>
              Support Availability: Mon - Sat • 9:00 AM - 6:00 PM IST
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
