'use client';

import styles from './PhilCards.module.css';

const sections = [
  {
    label: '🤝 Get Involved',
    title: 'Ways to Make a Difference',
    cards: [
      { icon: '👐', title: 'Volunteer', desc: 'Join our team of dedicated volunteers and make a difference in your community through construction and development projects.', url: 'https://venshitafoundation.org/registration' },
      { icon: '💝', title: 'Donate', desc: 'Support our mission with your generous donations. Every contribution helps us build better communities.', url: 'https://venshitafoundation.org/donate' },
      { icon: '🤝', title: 'Sponsor', desc: 'Become a sponsor and gain visibility while supporting meaningful construction initiatives and community projects.', url: 'https://venshitafoundation.org/sponsorship' },
      { icon: '📅', title: 'Upcoming Events', desc: 'Stay informed about our upcoming events, workshops, and community gatherings focused on sustainable construction.', url: 'https://venshitafoundation.org/participation' },
    ],
  },
  {
    label: '📋 Activities',
    title: 'Upcoming Activities & Media',
    cards: [
      { icon: '🔨', title: 'Upcoming Activities', desc: 'Discover our planned activities, training programs, and collaborative projects designed to empower communities.', url: 'https://venshitafoundation.org/upcoming' },
      { icon: '🖼️', title: 'Gallery', desc: 'Explore our collection of photos and moments from our community events, projects, and philanthropic activities.', url: 'https://venshitafoundation.org/gallary' },
    ],
  },
  {
    label: '🛠️ Our Services',
    title: 'Making a difference through diverse community service initiatives',
    cards: [
      { icon: '🏥', title: 'Health Care', desc: 'Providing essential healthcare services and medical support to underserved communities.', url: 'https://venshitafoundation.org/healthcare' },
      { icon: '🤲', title: 'Social Welfare', desc: 'Empowering communities through social programs and welfare initiatives.', url: 'https://venshitafoundation.org/socialwelfare' },
      { icon: '🕌', title: 'Religious', desc: 'Supporting religious and spiritual activities that strengthen community bonds.', url: 'https://venshitafoundation.org/religious' },
      { icon: '📚', title: 'Education', desc: 'Promoting quality education and learning opportunities for all age groups.', url: 'https://venshitafoundation.org/education' },
      { icon: '🌿', title: 'Environment', desc: 'Protecting and preserving our environment for future generations.', url: 'https://venshitafoundation.org/environment' },
      { icon: '🌊', title: 'Nirmalya Visarjan', desc: 'Eco-friendly immersion services maintaining sanctity while protecting water bodies.', url: 'https://venshitafoundation.org/nirmalyavisarjan' },
    ],
  },
];

export default function PhilCards() {
  return (
    <>
      {sections.map((section, si) => (
        <section key={si} className={styles.section}>
          <div className={styles.container}>
            <div className={styles.header}>
              <span className="section-label">{section.label}</span>
              <h2 className="section-title">{section.title}</h2>
            </div>
            <div className={styles.grid}>
              {section.cards.map((card, ci) => (
                <a
                  key={ci}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <span className={styles.icon}>{card.icon}</span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDesc}>{card.desc}</p>
                  <span className={styles.cardLink}>
                    {card.title === 'Donate' ? 'Donate Now' : card.title === 'Sponsor' ? 'Become a Sponsor' : card.title === 'Upcoming Events' ? 'View Events' : card.title === 'Upcoming Activities' ? 'Explore Activities' : card.title === 'Gallery' ? 'View Gallery' : 'Learn More'} →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
