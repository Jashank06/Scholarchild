import styles from './OpenRoles.module.css';

const categories = [
  {
    title: 'Engineering',
    icon: '💻',
    roles: [
      { title: 'Full Stack Engineer', location: 'Remote / Bangalore', type: 'Full-time' },
    ],
  },
  {
    title: 'Design',
    icon: '🎨',
    roles: [
      { title: 'Product Designer', location: 'Remote', type: 'Full-time' },
    ],
  },
  {
    title: 'Operations',
    icon: '🤝',
    roles: [
      { title: 'Partnership Manager', location: 'New Delhi', type: 'Full-time' },
    ],
  },
  {
    title: 'Marketing',
    icon: '📢',
    roles: [
      { title: 'Content Strategist', location: 'Remote', type: 'Contract' },
    ],
  },
];

export default function OpenRoles() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-label">🚀 Open Roles</span>
          <h2 className="section-title">
            Shape the <span className={styles.highlight}>Path</span> Forward
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7, textAlign: 'center' }}>
            Explore opportunities across teams — demo listings for now.
          </p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((cat, idx) => (
            <div key={idx} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <h3 className={styles.categoryTitle}>{cat.title}</h3>
              </div>
              <div className={styles.categoryRoles}>
                {cat.roles.map((role, i) => (
                  <div key={i} className={styles.roleItem}>
                    <div className={styles.roleInfo}>
                      <h4 className={styles.roleTitle}>{role.title}</h4>
                      <p className={styles.roleLocation}>{role.location}</p>
                    </div>
                    <div className={styles.roleActions}>
                      <span className={styles.typeBadge}>{role.type}</span>
                      <a
                        href="https://popoal.com/register"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.applyBtn}
                      >
                        Apply Now →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.exploreWrap}>
          <a
            href="https://popoal.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.exploreBtn}
          >
            ✨ Explore All Opportunities ✨
          </a>
        </div>
      </div>
    </section>
  );
}
