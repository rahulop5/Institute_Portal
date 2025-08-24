import React from "react";
import { createPortal } from "react-dom";
import styles from "../styles/ConfirmationDialog.module.css";

export default function ConfirmationDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
