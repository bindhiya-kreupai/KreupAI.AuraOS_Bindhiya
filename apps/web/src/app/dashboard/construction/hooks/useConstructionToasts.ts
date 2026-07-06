/**
 * useConstructionToasts — minimal toast queue for the construction pages.
 * Produces `Toast` objects (with an id) compatible with the shared
 * `ToastContainer`, and auto-dismisses after the given duration.
 */

'use client';

import { useCallback, useState } from 'react';
import type { Toast } from '../types';

let seq = 0;

export function useConstructionToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    seq += 1;
    const id = `toast-${Date.now()}-${seq}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  return { toasts, pushToast, dismissToast };
}
