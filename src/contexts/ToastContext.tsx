'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ToastData, ToastContainer } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const newToast: ToastData = {
      ...toast,
      id: generateId(),
    };

    setToasts(prev => [...prev, newToast]);
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 4000,
    });
  };

  const showError = (title: string, message?: string) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 5000, // エラーは少し長めに表示
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}