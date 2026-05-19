'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './faq.module.css';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.getFAQs();
        if (res.success) {
          setFaqs(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const categories = ['All', ...new Set(faqs.map(f => f.category))];

  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  const toggleAccordion = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.loader}></div></div>;
  }

  return (
    <div className={styles.faqContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleWrapper}>
            <span className={styles.titleIcon}>❓</span>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
          </div>
          <p className={styles.subtitle}>Find answers to the most common questions about tracking your child's scholarships, managing documents, and more.</p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.filterSection}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.activeFilter : ''}`}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.accordionContainer}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div 
                key={faq._id} 
                className={`${styles.accordionItem} ${openIndex === faq._id ? styles.open : ''}`}
              >
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => toggleAccordion(faq._id)}
                >
                  <span className={styles.question}>{faq.question}</span>
                  <span className={styles.icon}>
                    {openIndex === faq._id ? '−' : '+'}
                  </span>
                </button>
                <div className={styles.accordionBody}>
                  <div className={styles.answerText}>
                    {faq.answer.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <div className={styles.tagWrap}>
                    <span className={styles.categoryTag}>{faq.category}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              No FAQs available for this category right now.
            </div>
          )}
        </div>

        <div className={styles.contactSupport}>
          <h3>Still need help?</h3>
          <p>If you couldn't find the answer you were looking for, our support team is always here to assist you.</p>
          <a href="/parent/services" className={styles.supportLink}>Contact Support →</a>
        </div>
      </div>
    </div>
  );
}
