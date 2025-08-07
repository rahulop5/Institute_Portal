import React from 'react';
import styles from '../../../styles/Updatelist.module.css';
import warning from '../../../../assets/warning.svg';
import lock from '../../../../assets/padlock.svg';

const updateData = () => [
  {
    time: '13/02/24',
    content:
      'Added dropout between layers to reduce overfitting. Switched to Adam optimizer. Accuracy and F1-score set as evaluation metrics.',
  },
  {
    time: '29/04/24',
    content:
      'Enabled batch training with size 64. Xavier initialization applied to weights. Validation loss tracked after each epoch.',
  },
];

export default function Updatelist() {
  const updates = updateData();

  return (
  
    <div className={styles.list}>
        <h3 className={styles.heading}>Updates</h3>
        <div className={styles.listactions}>
            <div className={styles.table}>
              <div className={`${styles.row} ${styles.header}`}>
                <div className={styles.cellDate}>Date</div>
                <div className={styles.cellContent}>Content</div>
              </div>
              {updates.map((update, index) => (
                <div key={index} className={styles.row}>
                  <div className={styles.cellDate}>{update.time}</div>
                  <div className={styles.cellContent}>{update.content}</div>
                </div>
              ))}
            </div>
          <div className={styles.actions}>
              <div className={styles.evaluatebutton}>
                <p>
                  <img src={warning} alt="Warning" className={styles.icon} />
                  Evaluation submission triggers deadline initiation for evaluators.
                </p>
                <button>Evaluate now</button>
              </div>

              <div className={styles.updatebutton}>
                <p>
                  <img src={warning} alt="Warning" className={styles.icon} />
                  Adding updates operation is irreversible.
                </p>
                <button disabled>
                  Add update
                  <img src={lock} alt="Lock" className={styles.lockIcon} />
                </button>
              </div>
          </div>    
      </div>
    </div>

  );
}
