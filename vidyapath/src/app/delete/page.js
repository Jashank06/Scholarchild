import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';
import '@/styles/legal.css';

export const metadata = {
  title: 'Delete Account | Kushaagra',
  description: 'Request account and data deletion for your Kushaagra account.',
};

export default function DeleteAccount() {
  return (
    <>
      <Navbar />
      <main className="legalPage">
        <div className="legalContainer">
          <div className="legalCard" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🗑️</div>
            <h1 className="legalTitle">Delete Account</h1>
            <p className="legalSubtitle">We value your privacy and your right to be forgotten.</p>

            <div className="alertBox">
              <h3>⚠️ Important Notice</h3>
              <p style={{ color: '#FCA5A5', marginBottom: '1rem' }}>
                Deleting your account is permanent and cannot be undone.
              </p>
              <ul className="legalList" style={{ color: '#FCA5A5' }}>
                <li>All profile information will be permanently erased.</li>
                <li>Your scholarship application history will be removed.</li>
                <li>All saved opportunities and personalized alerts will be deleted.</li>
              </ul>
            </div>

            <section className="legalSection" style={{ textAlign: 'left' }}>
              <h2>How to Request Deletion</h2>
              <p>To delete your Kushaagra account and all associated data, please follow the steps below:</p>
              
              <div style={{ marginTop: '2rem' }}>
                <div className="optionCard" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                  <h4>Web/Email Request</h4>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Send an email to <strong style={{ color: '#818CF8' }}>delete@kushaagra.in</strong> with <strong>"Account Deletion Request"</strong> as the subject. 
                  </p>
                  <p style={{ marginTop: '1rem', opacity: 0.8 }}>
                    <strong>Note:</strong> Please ensure you send the request from the email address associated with your Kushaagra account so we can verify your identity.
                  </p>
                </div>
              </div>
            </section>

            <section className="legalSection" style={{ textAlign: 'left', marginTop: '3rem' }}>
              <h2>Data Retention Policy</h2>
              <p>
                Once a deletion request is confirmed, your data is removed from our active databases immediately. Backup copies may persist for up to 30 days before being completely purged. We may retain certain information only if required by law or for legitimate fraud prevention purposes.
              </p>
            </section>

            <div className="legalContactBox" style={{ marginTop: '3rem' }}>
              <p>Need help? Contact our support team at <strong>support@kushaagra.in</strong></p>
            </div>
          </div>
        </div>
      </main>
      <SectionDivider type="pulse" />
      <Footer />
    </>
  );
}
