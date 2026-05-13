import styles from './OpenRoles.module.css';

const roles = [
  { title: 'Full Stack Engineer', dept: 'Engineering', location: 'Remote / Bangalore', type: 'Full-time' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Partnership Manager', dept: 'Operations', location: 'New Delhi', type: 'Full-time' },
  { title: 'Content Strategist', dept: 'Marketing', location: 'Remote', type: 'Contract' },
];

export default function OpenRoles() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-label">🚀 Open Roles</span>
          <h2 className="section-title">Shape the <span className={styles.highlight}>Path</span> Forward</h2>
        </div>
        <div className={styles.roleGrid}>
          {roles.map((role, i) => (
            <div key={i} className={styles.roleCard}>
              <div className={styles.roleInfo}>
                <h3>{role.title}</h3>
                <p>{role.dept} • {role.location}</p>
              </div>
              <div className={styles.roleMeta}>
                <span className={styles.typeBadge}>{role.type}</span>
                <button className={styles.applyBtn}>Apply Now →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
