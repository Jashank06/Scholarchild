import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import '@/styles/legal.css';

export const metadata = {
  title: 'Privacy Policy | Kushaagra',
  description: 'Privacy Policy for Kushaagra - Learn how we handle your data and protect your privacy.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="legalPage">
        <div className="legalContainer">
          <div className="legalCard">
            <h1 className="legalTitle">Privacy Policy</h1>
            <p className="legalSubtitle">Last Updated: May 14, 2026</p>

            <section className="legalSection">
              <div className="legalDisclaimer" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <h3 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>⚠️ Government Information Disclaimer</h3>
                <p style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.6' }}>
                  Kushaagra is an independent information aggregator and is <strong>NOT affiliated with, authorized by, or endorsed by any government entity</strong>. We aggregate information from official government portals like <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>scholarships.gov.in</a> for educational purposes. We do not represent any government agency.
                </p>
              </div>

              <h2>1. Introduction</h2>
              <p>
                Welcome to Kushaagra ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application.
              </p>
            </section>

            <section className="legalSection">
              <h2>2. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
              </p>
              <ul className="legalList">
                <li><strong>Personal Data:</strong> Name, email address, phone number, educational details (grade, school, location).</li>
                <li><strong>Usage Data:</strong> Information about how you use our platform, including scholarship searches and applications.</li>
                <li><strong>Device Data:</strong> Information about your mobile device (ID, model, manufacturer, OS).</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>4. Data Sharing & Third Parties</h2>
              <p>
                We do not sell your personal data. We only share information in the following circumstances:
              </p>
              <ul className="legalList">
                <li><strong>Application Submission:</strong> When you apply for a scholarship through our platform, your data is shared with the respective awarding body (Government or Private) to process your application.</li>
                <li><strong>Compliance with Law:</strong> We may disclose information where we are legally required to do so in order to comply with applicable law or government requests.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>5. Data Security</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
            </section>

            <section className="legalSection">
              <h2>5. Your Privacy Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="legalList">
                <li>Access the personal information we hold about you.</li>
                <li>Request that we correct any inaccurate personal information.</li>
                <li>Request that we delete your personal information (see our Account Deletion page).</li>
                <li>Withdraw your consent at any time.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>6. Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <div className="legalContactBox">
                <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#fff' }}>Kushaagra Support Team</p>
                <p>Email: <strong>privacy@kushaagra.in</strong></p>
                <p>Address: New Delhi, India</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SectionDivider type="pulse" />
      <Footer />
    </>
  );
}
