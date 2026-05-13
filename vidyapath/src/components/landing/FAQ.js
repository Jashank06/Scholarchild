'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

const faqs = [
  {
    q: 'Is VidyaPath completely free to use?',
    a: 'Yes! VidyaPath is 100% free for students and parents. You can create a profile, discover opportunities, apply, and track your applications at no cost. We believe every student deserves access to every opportunity.',
  },
  {
    q: 'How does the AI Smart Match work?',
    a: 'When you create your profile, you tell us your grade, location, interests, academic achievements, and family details. Our AI engine analyzes this against all 10,000+ opportunities and gives each one a Match Score (0-100%). Higher scores mean better eligibility and relevance for you.',
  },
  {
    q: 'Which grades and boards does VidyaPath cover?',
    a: 'VidyaPath covers students from Grade 1 to Grade 12 across all boards — CBSE, ICSE, State Boards, IB, and IGCSE. Our database includes opportunities at Taluka, District, State, National, and International levels.',
  },
  {
    q: 'Are the scholarship listings verified?',
    a: 'Absolutely! Every scholarship, competition, and government scheme listed on VidyaPath is manually verified by our team. We source directly from official government portals (NSP, PFMS), organizational websites, and verified databases. We update listings weekly.',
  },
  {
    q: 'Can I apply to scholarships directly through VidyaPath?',
    a: 'For many opportunities, yes! You can apply directly using our built-in application system. For others, we redirect you to the official application page with all instructions. Our Document Vault auto-fills your details, saving you hours.',
  },
  {
    q: 'How do I get notified about new opportunities?',
    a: 'You can enable notifications via Email, SMS, WhatsApp, or Push Notifications in your settings. We also send a weekly digest of new opportunities matching your profile, and urgent "Closing Soon" alerts 48 hours before deadlines.',
  },
  {
    q: 'Can schools and parents also use VidyaPath?',
    a: 'Yes! Parents can create accounts linked to their child\'s profile for monitoring. Schools and counselors get a dedicated dashboard to recommend opportunities, track student participation, and view aggregate analytics.',
  },
  {
    q: 'Is my data safe on VidyaPath?',
    a: 'Security is our top priority. All documents and personal data are encrypted with AES-256 encryption. We comply with Indian IT laws and data privacy regulations. Your data is never shared with third parties without your consent.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section className={styles.section} id="faq">
      <div className={styles.sectionHeader}>
        <span className="section-label">🧠 Knowledge Base</span>
        <h2 className="section-title">
          Frequently Asked <span className={styles.faqHighlight}>Questions</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Everything you need to know about the VidyaPath ecosystem.
        </p>
      </div>

      <div className={styles.faqContainer}>
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className={`${styles.faqItem} ${openIdx === idx ? styles.open : ''}`}
          >
            <button
              className={styles.faqQuestion}
              onClick={() => toggle(idx)}
              aria-expanded={openIdx === idx}
            >
              <span>{faq.q}</span>
              <span className={styles.faqIcon}>+</span>
            </button>
            <div className={styles.faqAnswer}>
              <div className={styles.faqAnswerInner}>
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
