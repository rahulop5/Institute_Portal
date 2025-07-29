import React, { useState, useRef, useEffect } from 'react';
import styles from '../../../styles/Topicslist.module.css';

function TopicList({ topics, onDelete }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const expandedRef = useRef(null);

  const handleToggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleDelete = (index) => {
    // Delete logic here
  };

  const handleAddTopic = () => {
    // Backend logic will be handled elsewhere
    setShowModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  useEffect(() => {
    if (expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [expandedIndex]);

  return (
    <>
      {/* Topic List Section */}
      <section className={`${styles.container} ${showModal ? styles.blurred : ''}`}>
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

      {/* Add Topic Button (Outside the List Section) */}
      <div className={styles.addTopicContainer}>
        <button className={styles.addTopicBtn} onClick={() => setShowModal(true)}>
          Add Topic
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Add a topic</h2>

            <label>
              Topic title:
              <span className={styles.limit}>⚠️ 150 Character limit.</span>
              <input
                type="text"
                placeholder="Type here..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </label>

            <label>
              Topic description:
              <span className={styles.limit}>⚠️ 500 Character limit.</span>
              <textarea
                placeholder="Type here..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </label>

            <button className={styles.confirmBtn} onClick={handleAddTopic}>
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TopicList;
