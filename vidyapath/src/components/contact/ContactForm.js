'use client';

import { useState } from 'react';
import api from '@/lib/api';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', mobile: '', subject: 'General Inquiry', message: ''
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.mobile) {
      setStatus({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      await api.submitContact(form);
      setStatus({ type: 'success', text: 'Message sent successfully! We\'ll get back to you soon.' });
      setForm({ firstName: '', lastName: '', email: '', mobile: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.formContainer}>
            <div className={styles.glassCard}>
              <h2 className={styles.formTitle}>Send a Message</h2>
              {status.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', fontWeight: '600',
                  background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: status.type === 'success' ? '#059669' : '#DC2626',
                }}>{status.text}</div>
              )}
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label>First Name <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="text" placeholder="John" value={form.firstName} onChange={update('firstName')} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Last Name <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="text" placeholder="Doe" value={form.lastName} onChange={update('lastName')} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="email" placeholder="john@example.com" value={form.email} onChange={update('email')} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Mobile No. <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="tel" placeholder="+91 9876543210" value={form.mobile} onChange={update('mobile')} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Subject</label>
                  <select value={form.subject} onChange={update('subject')}>
                    <option>General Inquiry</option>
                    <option>Scholarship Support</option>
                    <option>Partnership Request</option>
                    <option>Careers</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Message</label>
                  <textarea placeholder="How can we help you?" value={form.message} onChange={update('message')} />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Deploy Message 🚀'}
                </button>
              </form>
            </div>
          </div>

          <div className={styles.visualSide}>
            <div className={styles.orbContainer}>
              <div className={styles.orbLarge} />
              <div className={styles.orbSmall} />
              <div className={styles.orbRing} />
              <div className={styles.orbRingTwo} />
            </div>
            <div className={styles.glassTagline}>
              <span className={styles.taglineIcon}>💬</span>
              <span>We&apos;d love to hear from you</span>
            </div>
            <div className={styles.floatingDots}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.dot} style={{
                  top: `${15 + i * 14}%`,
                  left: `${10 + (i % 3) * 35}%`,
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  animationDelay: `${i * 0.8}s`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
