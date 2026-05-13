import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BlogHero from '@/components/blogs/BlogHero';
import BlogGrid from '@/components/blogs/BlogGrid';
import SectionDivider from '@/components/landing/SectionDivider';

export default function BlogsPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <BlogHero />
        <SectionDivider type="marquee" />
        <BlogGrid />
        
        {/* Newsletter Deep Integration */}
        <section style={{ padding: '100px 0', background: '#F9FAFB' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '32px' }}>✉️</div>
            <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#0B0B1A', marginBottom: '20px' }}>Join the Newsletter</h2>
            <p style={{ fontSize: '20px', color: '#6B7280', marginBottom: '40px' }}>
              Get the latest scholarship news, deadlines, and success strategies 
              delivered straight to your inbox every Monday.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              background: 'white', 
              padding: '10px', 
              borderRadius: '100px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
            }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  padding: '0 2rem', 
                  outline: 'none', 
                  fontSize: '16px' 
                }} 
              />
              <button style={{ 
                padding: '1rem 3rem', 
                background: '#2563EB', 
                color: 'white', 
                border: 'none', 
                borderRadius: '100px',
                fontWeight: '800',
                cursor: 'pointer'
              }}>Subscribe</button>
            </div>
          </div>
        </section>

        <SectionDivider type="pulse" />
      </main>
      <Footer />
    </>
  );
}
