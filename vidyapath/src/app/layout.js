import '@/styles/globals.css';
import '@/styles/dashboard-system.css';

export const metadata = {
  title: 'VidyaPath — Discover Scholarships & Competitions for Indian Students',
  description: 'India\'s #1 platform for students (Grade 1-12) to discover scholarships, government schemes, and academic competitions. AI-powered recommendations, smart tracking, and 10,000+ opportunities.',
  keywords: 'scholarships India, student competitions, government schemes, olympiads, academic competitions, NSP, education',
  openGraph: {
    title: 'VidyaPath — Every Student Deserves Every Opportunity',
    description: 'Discover 10,000+ scholarships, competitions & government schemes for Grade 1-12 students across India.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0B0B1A" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
