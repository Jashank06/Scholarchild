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
        <SectionDivider type="marquee" />
        <Categories />
        <SectionDivider type="data" />
        <ImpactStats />
        <SectionDivider type="pulse" />
        <Features />
        <SectionDivider type="marquee" />
        <LatestOpportunities />
        <SectionDivider type="icons" />
        <Testimonials />
        <SectionDivider type="trust" />
        <ForSchools />
        <SectionDivider type="data" />
        <FAQ />
        <SectionDivider type="pulse" />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
