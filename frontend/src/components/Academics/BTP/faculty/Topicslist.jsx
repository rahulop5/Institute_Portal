import React, { useState, useRef, useEffect } from 'react';
import styles from '../../../styles/Topicslist.module.css';

function TopicList({ topics, onDelete }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const expandedRef = useRef(null);

  const handleToggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleDelete = (index) => {
    // Delete logic here
  };

  useEffect(() => {
    if (expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [expandedIndex]);

  return (
   <section className={styles.container}>
  <header className={styles.header}>
    <div>Topic</div>
    <div>Topic ID</div>
  </header>

  <div className={`${styles.scrollContainer} scrollContainer`}>
    {topics.map(([title, description, id], index) => (
      <article key={id} className={styles.topicCard}>
        <div className={styles.topicRow}>
          <div className={styles.topicTitle}>{title}</div>
          <div className={styles.topicActions}>
            <span className={styles.topicId}>{id}</span>
            <button
              onClick={() => handleToggle(index)}
              className={styles.toggleBtn}
              aria-expanded={expandedIndex === index}
            >
              {expandedIndex === index ? 'Less info' : 'More info'}
            </button>
          </div>
        </div>

        <div
          ref={expandedIndex === index ? expandedRef : null}
          className={`${styles.expanded} ${expandedIndex === index ? styles.expandedVisible : ''}`}
        >
          <p className={styles.topicdescrption}>{description}</p>
          <div className={styles.deleteActions}>
            <span className={styles.warning}>⚠️ Topic deletion triggers topic reset for selected teams.</span>
            <button onClick={() => handleDelete(index)} className={styles.deleteBtn}>
              Delete Topic
            </button>
          </div>
        </div>
      </article>
    ))}
  </div>
</section>
  );
}

export default TopicList;
