import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info } from './icons';
import { gsap, prefersReducedMotion } from '../animations/gsapConfig';
import styles from './Toast.module.css';

const ToastContext = createContext(null);
let idCounter = 0;

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success', duration = 3200) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.stack} aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const ref = useRef(null);
  const Icon = ICONS[toast.type] || Info;

  const setRef = useCallback((el) => {
    ref.current = el;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, x: 0 });
      return;
    }
    gsap.fromTo(el, { opacity: 0, x: 24, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: 'power3.out' });
  }, []);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} ref={setRef}>
      <Icon size={16} strokeWidth={1.75} />
      <span>{toast.message}</span>
      <button className={styles.close} onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
