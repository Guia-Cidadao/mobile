import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { Toast, type ToastMessage, type ToastType } from '@/components/feedback/Toast';

const TOAST_DURATION_MS = 3500;

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Provedor global de notificações (feedback visual de sucesso/erro). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast({ id: Date.now(), message, type });
    timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={value}>
      {children}
      {toast && <Toast key={toast.id} toast={toast} onDismiss={dismiss} />}
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const context = use(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider />');
  }
  return context;
}
