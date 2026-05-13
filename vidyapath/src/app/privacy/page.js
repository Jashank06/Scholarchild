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
              <h2>3. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="legalList">
                <li>Provide, operate, and maintain our platform.</li>
                <li>Improve, personalize, and expand our services.</li>
                <li>Match you with relevant scholarship and competition opportunities.</li>
                <li>Communicate with you regarding updates and support.</li>
                <li>Prevent fraudulent transactions and monitor against theft.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>4. Data Security</h2>
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
