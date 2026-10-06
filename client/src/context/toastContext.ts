import { createContext, useContext } from 'react';

export type ToastKind = 'success' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

export interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | undefined>(undefined);

/** Shows short, self-dismissing notifications. Requires a `ToastProvider` above. */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
