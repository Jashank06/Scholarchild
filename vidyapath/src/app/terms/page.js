import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import '@/styles/legal.css';

export const metadata = {
  title: 'Terms of Service | Kushaagra',
  description: 'Terms of Service for Kushaagra — Understand the rules and guidelines for using our platform.',
};

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="legalPage">
        <div className="legalContainer">
          <div className="legalCard">
            <h1 className="legalTitle">Terms of Service</h1>
            <p className="legalSubtitle">Last Updated: June 2, 2026</p>

            <section className="legalSection">
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to Kushaagra, an initiative by Venshita Foundation. By accessing or using our website, mobile application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you ("User," "you," or "your") and Venshita Foundation ("we," "our," or "us"). If you are using the Platform on behalf of a minor (under 18 years), you represent that you are the parent or legal guardian and accept these Terms on their behalf.
              </p>
            </section>

            <section className="legalSection">
              <h2>2. Description of Service</h2>
              <p>
                Kushaagra is a unified platform that helps students discover, apply to, and track scholarships, olympiads, competitions, government schemes, and other educational opportunities across India. Our services include:
              </p>
              <ul className="legalList">
                <li>AI-powered opportunity matching based on student profiles.</li>
                <li>Secure document storage and auto-fill for applications.</li>
                <li>Application tracking with real-time status updates.</li>
                <li>Notifications and alerts for deadlines and new opportunities.</li>
                <li>Parent and school dashboards for monitoring progress.</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without prior notice.
              </p>
            </section>

            <section className="legalSection">
              <h2>3. User Accounts & Registration</h2>
              <p>
                To access certain features of the Platform, you must create an account. When registering, you agree to:
              </p>
              <ul className="legalList">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain and update your account information as needed.</li>
                <li>Keep your login credentials confidential and secure.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
              </ul>
              <p>
                You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms or provide false information.
              </p>
            </section>

            <section className="legalSection">
              <h2>4. User Conduct</h2>
              <p>
                You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="legalList">
                <li>Submit false or misleading information in your profile or applications.</li>
                <li>Impersonate any person or entity or misrepresent your affiliation.</li>
                <li>Upload viruses, malware, or any harmful code.</li>
                <li>Attempt to gain unauthorized access to any part of the Platform.</li>
                <li>Use the Platform for any commercial purpose without our express written consent.</li>
                <li>Interfere with or disrupt the integrity or performance of the Platform.</li>
                <li>Collect or harvest any personally identifiable information from other users.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>5. Intellectual Property</h2>
              <p>
                The Platform and its entire contents, features, and functionality (including but not limited to text, graphics, logos, icons, images, audio clips, data compilations, and software) are owned by Venshita Foundation or its licensors and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works from, publicly display, or otherwise use any content from the Platform without our prior written permission.
              </p>
            </section>

            <section className="legalSection">
              <h2>6. Third-Party Links & Services</h2>
              <p>
                The Platform may contain links to third-party websites or services that are not owned or controlled by us. This includes links to official government portals such as scholarships.gov.in and external application forms.
              </p>
              <p>
                We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that Venshita Foundation shall not be liable for any damages or losses caused by your use of any third-party services.
              </p>
            </section>

            <section className="legalSection">
              <h2>7. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not warrant that:
              </p>
              <ul className="legalList">
                <li>The Platform will be uninterrupted, timely, secure, or error-free.</li>
                <li>The results obtained from using the Platform will be accurate or reliable.</li>
                <li>Any errors in the Platform will be corrected.</li>
              </ul>
              <p>
                We make no guarantees regarding the availability or accuracy of scholarship, competition, or scheme listings. Information is gathered from public sources and may contain errors or omissions. Users are encouraged to verify details directly with the awarding body.
              </p>
            </section>

            <section className="legalSection">
              <h2>8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, Venshita Foundation, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="legalList">
                <li>Loss of profits, data, or opportunities.</li>
                <li>Personal injury or property damage arising from your use of the Platform.</li>
                <li>Unauthorized access to or alteration of your transmissions or data.</li>
                <li>Statements or conduct of any third party on the Platform.</li>
              </ul>
              <p>
                Our total liability to you for any claim arising from or relating to these Terms shall not exceed ₹1,000.
              </p>
            </section>

            <section className="legalSection">
              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Platform at any time, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
              <p>
                Upon termination:
              </p>
              <ul className="legalList">
                <li>Your right to use the Platform will immediately cease.</li>
                <li>We may retain certain data as required by law or for legitimate business purposes.</li>
                <li>Sections 5 (Intellectual Property), 7 (Disclaimer), 8 (Limitation of Liability), and 10 (Governing Law) shall survive termination.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>10. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
              </p>
              <p>
                We encourage you to reach out to us first before initiating any formal dispute. We are committed to resolving issues amicably.
              </p>
            </section>

            <section className="legalSection">
              <h2>11. Changes to These Terms</h2>
              <p>
                We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting on this page. We will notify users of material changes via email or through the Platform. Your continued use of the Platform after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="legalSection">
              <h2>12. Contact Us</h2>
              <p>
                If you have any questions, concerns, or feedback regarding these Terms, please contact us:
              </p>
              <div className="legalContactBox">
                <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#fff' }}>Kushaagra — Venshita Foundation</p>
                <p>Email: <strong>legal@vidyapath.in</strong></p>
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
