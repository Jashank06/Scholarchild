import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Categories from '@/components/landing/Categories';
import ImpactStats from '@/components/landing/ImpactStats';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import LatestOpportunities from '@/components/landing/LatestOpportunities';
import ForSchools from '@/components/landing/ForSchools';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SectionDivider type="wave" color="amber" />
        <Categories />
        <SectionDivider type="wave-reverse" color="blue" />
        <ImpactStats />
        <SectionDivider type="wave" color="purple" />
        <Features />
        <SectionDivider type="wave-reverse" color="amber" />
        <LatestOpportunities />
        <SectionDivider type="wave" color="rose" />
        <Testimonials />
        <SectionDivider type="wave-reverse" color="emerald" />
        <ForSchools />
        <SectionDivider type="wave" color="purple" />
        <FAQ />
        <SectionDivider type="wave-reverse" color="blue" />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
