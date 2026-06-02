import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import '@/styles/legal.css';

export const metadata = {
  title: 'Cookie Policy | Kushaagra',
  description: 'Cookie Policy for Kushaagra — Learn about how we use cookies and your choices.',
};

export default function CookiePolicy() {
  return (
    <>
      <Navbar />
      <main className="legalPage">
        <div className="legalContainer">
          <div className="legalCard">
            <h1 className="legalTitle">Cookie Policy</h1>
            <p className="legalSubtitle">Last Updated: June 2, 2026</p>

            <section className="legalSection">
              <h2>1. What Are Cookies</h2>
              <p>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide information to the website owners.
              </p>
              <p>
                This Cookie Policy explains what cookies we use on Kushaagra, why we use them, and how you can control them.
              </p>
            </section>

            <section className="legalSection">
              <h2>2. Types of Cookies We Use</h2>
              <p>
                We use the following categories of cookies on our platform:
              </p>

              <h3 style={{ color: '#818CF8', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Essential Cookies</h3>
              <p>
                These cookies are necessary for the Platform to function properly. They enable core features such as user authentication, session management, and security. Without these cookies, certain services cannot be provided.
              </p>
              <ul className="legalList">
                <li><strong>Session Cookie:</strong> Maintains your login state while you navigate the Platform.</li>
                <li><strong>CSRF Token:</strong> Protects against cross-site request forgery attacks.</li>
                <li><strong>Security Cookie:</strong> Helps detect and prevent fraudulent activity.</li>
              </ul>

              <h3 style={{ color: '#818CF8', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Analytics Cookies</h3>
              <p>
                These cookies help us understand how users interact with our Platform by collecting and reporting information anonymously. We use this data to improve our platform and user experience.
              </p>
              <ul className="legalList">
                <li><strong>Page Visit Tracking:</strong> Records which pages are visited and how users navigate between them.</li>
                <li><strong>Feature Usage:</strong> Tracks which features are most and least used to guide product development.</li>
                <li><strong>Performance Monitoring:</strong> Helps us identify and fix technical issues.</li>
              </ul>

              <h3 style={{ color: '#818CF8', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Functional Cookies</h3>
              <p>
                These cookies enable enhanced functionality and personalization. They remember your preferences and choices to provide a tailored experience.
              </p>
              <ul className="legalList">
                <li><strong>Language Preference:</strong> Remembers your selected language (Hindi, English, etc.).</li>
                <li><strong>Theme Preference:</strong> Saves your display preferences.</li>
                <li><strong>Recently Viewed:</strong> Keeps track of recently viewed opportunities for quick access.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>3. How We Use Cookies</h2>
              <p>
                We use cookies for the following purposes:
              </p>
              <ul className="legalList">
                <li><strong>Authentication:</strong> To keep you logged in and maintain your session securely.</li>
                <li><strong>Personalization:</strong> To remember your preferences and provide relevant recommendations.</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve our platform.</li>
                <li><strong>Security:</strong> To protect your account and prevent unauthorized access.</li>
                <li><strong>Performance:</strong> To ensure fast loading times and optimal performance.</li>
              </ul>
            </section>

            <section className="legalSection">
              <h2>4. Third-Party Cookies</h2>
              <p>
                We may use limited third-party services that set cookies on your device. These include:
              </p>
              <ul className="legalList">
                <li><strong>Google Analytics:</strong> For anonymized usage analytics. Google's privacy policy can be found at <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>policies.google.com/privacy</a>.</li>
                <li><strong>Cloudflare:</strong> For security and performance optimization.</li>
              </ul>
              <p>
                We do not use advertising cookies or tracking cookies for marketing purposes. We do not sell your browsing data to third parties.
              </p>
            </section>

            <section className="legalSection">
              <h2>5. Your Cookie Choices</h2>
              <p>
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
              </p>
              <p>
                Here's how to manage cookies in popular browsers:
              </p>
              <ul className="legalList">
                <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data.</li>
                <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data.</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data.</li>
                <li><strong>Microsoft Edge:</strong> Settings → Site permissions → Cookies and site data.</li>
              </ul>
              <p>
                Please note that if you disable essential cookies, some features of the Platform may not function properly.
              </p>
            </section>

            <section className="legalSection">
              <h2>6. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. Changes will be effective immediately upon posting on this page with an updated "Last Updated" date.
              </p>
            </section>

            <section className="legalSection">
              <h2>7. Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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
