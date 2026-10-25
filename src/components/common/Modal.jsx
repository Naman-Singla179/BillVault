
import { useEffect } from "react";
import "./Modal.css";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}) {
  useEffect(() => {
    if (isOpen) {
      function handleKey(event) {
        if (event.key === "Escape") {
          onClose();
        }
      }

      document.addEventListener("keydown", handleKey);

      return () => {
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {onConfirm && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              {cancelText}
            </button>

            <button
              className={
                danger ? "btn btn-danger" : "btn btn-primary"
              }
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
