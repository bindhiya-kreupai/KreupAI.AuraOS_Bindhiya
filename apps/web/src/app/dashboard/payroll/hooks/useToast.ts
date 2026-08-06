/**
 * Toast Hook
 * Manages toast notifications state and operations
 */

import { useState, useCallback } from 'react';
import type { Toast } from '../types';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: any, type: Toast['type'] = 'info', duration = 5000) => {
    let strMessage = 'An unexpected event occurred';
    if (typeof message === 'string') {
      strMessage = message;
    } else if (message && typeof message === 'object') {
      strMessage = message.message || message.error || message.details || JSON.stringify(message);
    }
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message: strMessage, type, duration };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'error', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'info', duration);
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
