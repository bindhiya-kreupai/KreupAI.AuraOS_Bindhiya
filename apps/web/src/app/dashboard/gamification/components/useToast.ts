'use client';

import { useCallback, useState } from 'react';
import type { Toast } from '../types';

/**
 * Minimal toast queue for the gamification pages. Pairs with <ToastContainer />.
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type: Toast['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  return { toasts, dismiss, push };
}
