
import { createContext, useContext, useState, useRef } from "react";
import ToastContainer from "../components/common/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function show(message, type, duration) {
    const id = nextId.current++;

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      dismiss(id);
    }, duration);
  }

  const toast = {
    success: (message) => show(message, "success", 3500),
    error: (message) => show(message, "error", 5000),
    warning: (message) => show(message, "warning", 4000),
    info: (message) => show(message, "info", 3500),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);

  if (!toast) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }

  return toast;
}
