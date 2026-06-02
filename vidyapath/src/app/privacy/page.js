import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import '@/styles/legal.css';

export const metadata = {
  title: 'Privacy Policy | Kushaagra',
  description: 'Privacy Policy for Kushaagra — Learn how we handle your data and protect your privacy.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="legalPage">
        <div className="legalContainer">
          <div className="legalCard">
            <h1 className="legalTitle">Privacy Policy</h1>
            <p className="legalSubtitle">Last Updated: June 2, 2026</p>

            <section className="legalSection">
              <div className="alertBox">
                <h3>⚠️ Government Information Disclaimer</h3>
                <p style={{ color: '#CBD5E1' }}>
                  Kushaagra is an independent information aggregator and is <strong>NOT affiliated with, authorized by, or endorsed by any government entity</strong>. We aggregate information from official government portals like <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>scholarships.gov.in</a> for educational purposes. We do not represent any government agency.
                </p>
              </div>

              <h2>1. Introduction</h2>
              <p>
                Welcome to Kushaagra, an initiative by Venshita Foundation ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application.
              </p>
              <p>
                By using Kushaagra, you agree to the collection and use of information in accordance with this policy. If you do not agree with any part of this policy, please do not use our platform.
              </p>
            </section>

            <section className="legalSection">
              <h2>2. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the platform, create a profile, apply for opportunities, or contact us.
              </p>
              <ul className="legalList">
                <li><strong>Personal Data:</strong> Name, email address, phone number, date of birth, educational details (grade, school, board, location).</li>
                <li><strong>Document Data:</strong> Uploaded documents such as Aadhaar, marksheets, income certificates, and photographs that you choose to store in your document vault.</li>
                <li><strong>Usage Data:</strong> Information about how you use our platform, including scholarship searches, applications submitted, and features accessed.</li>
                <li><strong>Device Data:</strong> Information about your mobile device (device ID, model, operating system, browser type).</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>3. How We Use Your Information</h2>
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul className="legalList">
                <li>To create and manage your account and profile.</li>
                <li>To match you with relevant scholarships, competitions, and government schemes.</li>
                <li>To process and track your applications to various opportunities.</li>
                <li>To send you notifications about deadlines, new opportunities, and application status updates.</li>
                <li>To improve and optimize our platform based on usage patterns.</li>
                <li>To comply with legal obligations and prevent fraud.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>4. Data Sharing & Third Parties</h2>
              <p>
                We do not sell your personal data to anyone. We only share information in the following circumstances:
              </p>
              <ul className="legalList">
                <li><strong>Application Submission:</strong> When you apply for a scholarship, competition, or scheme through our platform, your data is shared with the respective awarding body (government or private) to process your application.</li>
                <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who help us operate our platform (e.g., cloud hosting, email delivery, analytics). These providers are contractually bound to protect your data.</li>
                <li><strong>Compliance with Law:</strong> We may disclose information where we are legally required to do so in order to comply with applicable law, court orders, or government requests.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>5. Data Security</h2>
              <p>
                We implement administrative, technical, and physical security measures to help protect your personal information. This includes AES-256 encryption for stored documents, HTTPS for all data in transit, and regular security audits.
              </p>
              <p>
                However, please be aware that despite our efforts, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            <section className="legalSection">
              <h2>6. Data Retention</h2>
              <p>
                We retain your personal information only for as long as is necessary for the purposes set out in this policy. When you delete your account, we will delete or anonymize your personal data within 30 days, unless we are legally required to retain it.
              </p>
            </section>

            <section className="legalSection">
              <h2>7. Your Privacy Rights</h2>
              <p>
                You have the following rights regarding your personal data:
              </p>
              <ul className="legalList">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> Request that we correct any inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> Request that we delete your personal information (see our Account Deletion page).</li>
                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format.</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw your consent at any time, which will not affect the lawfulness of processing based on consent before its withdrawal.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at the email below. We will respond to your request within 30 days.
              </p>
            </section>

            <section className="legalSection">
              <h2>8. Children's Privacy</h2>
              <p>
                Kushaagra is designed for students of all ages. For users under 18 years of age, we require parental or guardian consent before collecting personal information. We encourage parents to monitor their children's online activity and to help us protect their privacy.
              </p>
            </section>

            <section className="legalSection">
              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="legalSection">
              <h2>10. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:
              </p>
              <div className="legalContactBox">
                <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#fff' }}>Kushaagra — Venshita Foundation</p>
                <p>Email: <strong>privacy@vidyapath.in</strong></p>
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
