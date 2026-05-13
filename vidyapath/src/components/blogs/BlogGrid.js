import styles from './BlogGrid.module.css';

const articles = [
  { title: 'Understanding the NSP 2.0 Portal', cat: 'GOVT SCHEMES', time: '5 min read', desc: 'Everything you need to know about the new National Scholarship Portal updates.' },
  { title: 'Top 10 Olympiads in India', cat: 'COMPETITIONS', time: '10 min read', desc: 'A comprehensive list of Olympiads for Science, Math, and Cyber enthusiasts.' },
  { title: 'Drafting the Perfect SOP', cat: 'ADMISSIONS', time: '7 min read', desc: 'How to write a Statement of Purpose that grabs attention.' },
  { title: 'The Future of AI in Education', cat: 'TECHNOLOGY', time: '12 min read', desc: 'Exploring how artificial intelligence is personalizing learning paths.' },
  { title: 'Philanthropy and Student Support', cat: 'COMMUNITY', time: '6 min read', desc: 'The role of corporate social responsibility in student welfare.' },
  { title: 'Success Story: Meet Rahul S.', cat: 'SUCCESS', time: '4 min read', desc: 'How one student used Kushaagra to secure 3 simultaneous scholarships.' },
];

export default function BlogGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.filters}>
            <span className={styles.filterActive}>All Articles</span>
            <span>Scholarships</span>
            <span>Competitions</span>
            <span>Career Tips</span>
          </div>
        </div>

        <div className={styles.grid}>
          {articles.map((art, i) => (
            <div key={i} className={styles.articleCard}>
              <div className={styles.cardHeader}>
                <span className={styles.catBadge}>{art.cat}</span>
                <span className={styles.readTime}>{art.time}</span>
              </div>
              <h3 className={styles.artTitle}>{art.title}</h3>
              <p className={styles.artDesc}>{art.desc}</p>
              <div className={styles.cardFooter}>
                <button className={styles.linkBtn}>Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
