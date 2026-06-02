import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PhilHero from '@/components/philanthropy/PhilHero';
import PhilCards from '@/components/philanthropy/PhilCards';

export default function PhilanthropyPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <PhilHero />
        <PhilCards />
      </main>
      <Footer />
    </>
  );
}
