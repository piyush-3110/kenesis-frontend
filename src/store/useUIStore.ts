import { create } from 'zustand';

interface UIState {
  // Global loading states
  globalLoading: boolean;
  
  // Modal states
  modals: {
    login: boolean;
    signup: boolean;
    videoPlayer: boolean;
    documentViewer: boolean;
  };
  
  // Sidebar states
  mobileSidebar: boolean;
  
  // Theme and preferences
  theme: 'dark' | 'light';
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  
  // Actions
  setGlobalLoading: (loading: boolean) => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  toggleMobileSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  globalLoading: false,
  modals: {
    login: false,
    signup: false,
    videoPlayer: false,
    documentViewer: false,
  },
  mobileSidebar: false,
  theme: 'dark',
  toasts: [],

  // Actions
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
  
  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),
    
  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),
    
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebar: !state.mobileSidebar })),
    
  setTheme: (theme) => set({ theme }),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
    
  clearToasts: () => set({ toasts: [] }),
}));

// Selectors for optimal performance
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);
export const useModals = () => useUIStore((state) => state.modals);
export const useMobileSidebar = () => useUIStore((state) => state.mobileSidebar);
export const useTheme = () => useUIStore((state) => state.theme);
export const useToasts = () => useUIStore((state) => state.toasts);
export const useAddToast = () => useUIStore((state) => state.addToast);
