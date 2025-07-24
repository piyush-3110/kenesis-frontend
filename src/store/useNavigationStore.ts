import { create } from 'zustand';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'user' | 'content';
  url: string;
  description?: string;
}

interface NavigationState {
  // Current page info
  currentPage: string;
  pageTitle: string;
  breadcrumbs: BreadcrumbItem[];
  
  // Navigation history
  navigationHistory: string[];
  
  // Search state
  globalSearchQuery: string;
  searchResults: SearchResult[];
  searchLoading: boolean;
  
  // Actions
  setCurrentPage: (page: string, title: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addToHistory: (path: string) => void;
  setGlobalSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSearchLoading: (loading: boolean) => void;
  clearSearch: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Initial state
  currentPage: '',
  pageTitle: '',
  breadcrumbs: [],
  navigationHistory: [],
  globalSearchQuery: '',
  searchResults: [],
  searchLoading: false,

  // Actions
  setCurrentPage: (currentPage, pageTitle) => 
    set({ currentPage, pageTitle }),
    
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  addToHistory: (path) =>
    set((state) => ({
      navigationHistory: [path, ...state.navigationHistory.filter(p => p !== path)].slice(0, 10),
    })),
    
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchLoading: (searchLoading) => set({ searchLoading }),
  
  clearSearch: () =>
    set({
      globalSearchQuery: '',
      searchResults: [],
      searchLoading: false,
    }),
}));

// Selectors for optimal performance
export const useCurrentPage = () => useNavigationStore((state) => state.currentPage);
export const usePageTitle = () => useNavigationStore((state) => state.pageTitle);
export const useBreadcrumbs = () => useNavigationStore((state) => state.breadcrumbs);
export const useGlobalSearch = () => useNavigationStore((state) => ({
  query: state.globalSearchQuery,
  results: state.searchResults,
  loading: state.searchLoading,
}));
