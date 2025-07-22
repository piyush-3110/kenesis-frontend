// Global stores
export * from './useAuthStore';
export * from './useUIStore';
export * from './useNavigationStore';

// Page-specific stores
export * from '../app/marketplace/store/useMarketplaceStore';
export * from '../app/product/store/useProductStore';

// Store utilities and types
export interface StoreState {
  auth: ReturnType<typeof import('./useAuthStore').useAuthStore>;
  ui: ReturnType<typeof import('./useUIStore').useUIStore>;
  navigation: ReturnType<typeof import('./useNavigationStore').useNavigationStore>;
}

// Reset all stores utility
export const resetAllStores = () => {
  // Import stores dynamically to avoid circular dependencies
  import('./useAuthStore').then(({ useAuthStore }) => {
    useAuthStore.getState().logout();
  });
  
  import('./useUIStore').then(({ useUIStore }) => {
    useUIStore.getState().clearToasts();
  });
  
  import('./useNavigationStore').then(({ useNavigationStore }) => {
    useNavigationStore.getState().clearSearch();
  });
  
  import('../app/marketplace/store/useMarketplaceStore').then(({ useMarketplaceStore }) => {
    useMarketplaceStore.getState().reset();
  });
  
  import('../app/product/store/useProductStore').then(({ useProductStore }) => {
    useProductStore.getState().reset();
  });
};

// Store persistence utility (for localStorage)
export const persistStore = (storeName: string, state: any) => {
  try {
    localStorage.setItem(`kenesis_${storeName}`, JSON.stringify(state));
  } catch (error) {
    console.error(`Failed to persist ${storeName} store:`, error);
  }
};

export const loadPersistedStore = (storeName: string) => {
  try {
    const persistedState = localStorage.getItem(`kenesis_${storeName}`);
    return persistedState ? JSON.parse(persistedState) : null;
  } catch (error) {
    console.error(`Failed to load persisted ${storeName} store:`, error);
    return null;
  }
};
