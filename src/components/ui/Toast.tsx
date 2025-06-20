'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastData {
  id: string;
  type: 'success' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // エントランスアニメーション
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // 自動削除タイマー
    const duration = toast.duration || 4000;
    const autoRemoveTimer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoRemoveTimer);
    };
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const bgColor = toast.type === 'success' 
    ? 'bg-green-50 border-green-200' 
    : 'bg-red-50 border-red-200';
  
  const textColor = toast.type === 'success' 
    ? 'text-green-800' 
    : 'text-red-800';
  
  const iconColor = toast.type === 'success' 
    ? 'text-green-400' 
    : 'text-red-400';

  const Icon = toast.type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`
        relative flex w-full max-w-sm mx-auto mt-4 overflow-hidden border rounded-lg shadow-lg
        ${bgColor}
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-center justify-center w-12 bg-transparent">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <div className="px-4 py-2 -mx-3">
        <div className="mx-3">
          <span className={`font-semibold ${textColor}`}>
            {toast.title}
          </span>
          {toast.message && (
            <p className={`text-sm ${textColor} mt-1`}>
              {toast.message}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleRemove}
        className={`
          absolute top-2 right-2 p-1 rounded-md transition-colors
          ${toast.type === 'success' 
            ? 'text-green-500 hover:text-green-700 hover:bg-green-100' 
            : 'text-red-500 hover:text-red-700 hover:bg-red-100'
          }
        `}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}