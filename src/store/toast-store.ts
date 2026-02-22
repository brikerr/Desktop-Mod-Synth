import { create } from 'zustand';
import type { ModuleType } from '../types/index.ts';

export interface Toast {
  id: string;
  message: string;
  moduleType: ModuleType;
}

let nextToastId = 1;

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, moduleType: ModuleType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, moduleType) => {
    const id = `toast_${nextToastId++}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, moduleType }] }));
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
