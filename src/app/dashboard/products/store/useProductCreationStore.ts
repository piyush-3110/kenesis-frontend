import { create } from 'zustand';
import { ProductCreationState, Course, Chapter, Module, CreateCourseStep, CourseType, CourseLevel } from '../types';

/**
 * Product Creation Store
 * Manages state for the multi-step course creation process with API integration
 */
interface ProductCreationStore extends ProductCreationState {
  // Actions
  setCurrentStep: (step: CreateCourseStep) => void;
  setCurrentCourse: (course: Course | null) => void;
  setSelectedChapterId: (chapterId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Course actions
  createCourse: (courseData: Partial<Course>) => void;
  updateCourse: (updates: Partial<Course>) => void;
  
  // Chapter actions
  addChapter: (chapter: Omit<Chapter, 'id' | 'order'>) => void;
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (chapterId: string) => void;
  reorderChapters: (chapters: Chapter[]) => void;
  
  // Module actions
  addModule: (chapterId: string, module: Omit<Module, 'id'>) => void;
  updateModule: (chapterId: string, moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (chapterId: string, moduleId: string) => void;
  reorderModules: (chapterId: string, modules: Module[]) => void;
  
  // API integration actions
  submitCourseCreation: () => Promise<{ success: boolean; courseId?: string; message: string }>;
  submitChapterCreation: (chapterData: { title: string; description: string }) => Promise<{ success: boolean; chapterId?: string; message: string }>;
  submitModuleCreation: (chapterId: string, moduleData: FormData) => Promise<{ success: boolean; moduleId?: string; message: string }>;
  submitForReview: (submissionNotes?: string) => Promise<{ success: boolean; message: string }>;
  
  // Utility actions
  resetCreation: () => void;
  generateId: () => string;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useProductCreationStore = create<ProductCreationStore>((set, get) => ({
  // Initial state
  currentStep: 'course',
  currentCourse: null,
  selectedChapterId: null,
  isLoading: false,
  error: null,

  // Basic setters
  setCurrentStep: (step) => set({ currentStep: step }),
  setCurrentCourse: (course) => {
    console.log('🏪 Store - Setting current course:', course);
    set({ currentCourse: course });
  },
  setSelectedChapterId: (chapterId) => set({ selectedChapterId: chapterId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Course actions
  createCourse: (courseData) => {
    const newCourse: Course = {
      id: generateId(),
      title: '',
      type: 'free' as CourseType,
      shortDescription: '',
      description: '',
      level: 'beginner' as CourseLevel,
      language: 'en',
      price: 0,
      tokenToPayWith: [],
      accessDuration: -1,
      affiliatePercentage: 1000,
      availableQuantity: -1,
      chapters: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      ...courseData,
    };
    set({ currentCourse: newCourse });
  },

  updateCourse: (updates) => {
    const { currentCourse } = get();
    if (currentCourse) {
      set({
        currentCourse: {
          ...currentCourse,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  // Chapter actions
  addChapter: (chapterData) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const newChapter: Chapter = {
      ...chapterData,
      id: generateId(), // Local ID for UI state
      order: currentCourse.chapters.length + 1,
      modules: chapterData.modules || [],
      backendId: chapterData.backendId, // Preserve backend ID if provided
    };

    set({
      currentCourse: {
        ...currentCourse,
        chapters: [...currentCourse.chapters, newChapter],
      },
    });
  },

  updateChapter: (chapterId, updates) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const updatedChapters = currentCourse.chapters.map((chapter) =>
      chapter.id === chapterId ? { ...chapter, ...updates } : chapter
    );

    set({
      currentCourse: {
        ...currentCourse,
        chapters: updatedChapters,
      },
    });
  },

  deleteChapter: (chapterId) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const filteredChapters = currentCourse.chapters
      .filter((chapter) => chapter.id !== chapterId)
      .map((chapter, index) => ({ ...chapter, order: index + 1 }));

    set({
      currentCourse: {
        ...currentCourse,
        chapters: filteredChapters,
      },
    });
  },

  reorderChapters: (chapters) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    set({
      currentCourse: {
        ...currentCourse,
        chapters: chapters.map((chapter, index) => ({ ...chapter, order: index + 1 })),
      },
    });
  },

  // Module actions
  addModule: (chapterId, moduleData) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const chapter = currentCourse.chapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;

    const newModule: Module = {
      ...moduleData,
      id: generateId(), // Local ID for UI state
      attachments: moduleData.attachments || [], // Preserve attachments
      backendId: moduleData.backendId, // Preserve backend ID if provided
    };

    const updatedChapters = currentCourse.chapters.map((ch) =>
      ch.id === chapterId
        ? { ...ch, modules: [...ch.modules, newModule] }
        : ch
    );

    set({
      currentCourse: {
        ...currentCourse,
        chapters: updatedChapters,
      },
    });
  },

  updateModule: (chapterId, moduleId, updates) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const updatedChapters = currentCourse.chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            modules: chapter.modules.map((module) =>
              module.id === moduleId ? { ...module, ...updates } : module
            ),
          }
        : chapter
    );

    set({
      currentCourse: {
        ...currentCourse,
        chapters: updatedChapters,
      },
    });
  },

  deleteModule: (chapterId, moduleId) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const updatedChapters = currentCourse.chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            modules: chapter.modules
              .filter((module) => module.id !== moduleId)
              .map((module, index) => ({ ...module, order: index + 1 })),
          }
        : chapter
    );

    set({
      currentCourse: {
        ...currentCourse,
        chapters: updatedChapters,
      },
    });
  },

  reorderModules: (chapterId, modules) => {
    const { currentCourse } = get();
    if (!currentCourse) return;

    const updatedChapters = currentCourse.chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            modules: modules.map((module, index) => ({ ...module, order: index + 1 })),
          }
        : chapter
    );

    set({
      currentCourse: {
        ...currentCourse,
        chapters: updatedChapters,
      },
    });
  },

  // API integration actions - simplified for component usage
  submitCourseCreation: async () => {
    const { currentCourse } = get();
    if (!currentCourse) return { success: false, message: 'No course data available' };
    
    // This will be called from components with proper hook integration
    return { success: true, courseId: 'temp-id', message: 'Course creation handled by component' };
  },

  submitChapterCreation: async (chapterData) => {
    const { currentCourse } = get();
    if (!currentCourse?.id) return { success: false, message: 'No course data available' };
    
    // This will be called from components with proper hook integration
    return { success: true, chapterId: 'temp-id', message: 'Chapter creation handled by component' };
  },

  submitModuleCreation: async (chapterId, moduleData) => {
    const { currentCourse } = get();
    if (!currentCourse?.id) return { success: false, message: 'No course data available' };
    
    // This will be called from components with proper hook integration
    return { success: true, moduleId: 'temp-id', message: 'Module creation handled by component' };
  },

  submitForReview: async (submissionNotes) => {
    const { currentCourse } = get();
    if (!currentCourse?.id) return { success: false, message: 'No course data available' };
    
    // This will be called from components with proper hook integration
    return { success: true, message: 'Course submission handled by component' };
  },

  // Utility actions
  resetCreation: () =>
    set({
      currentStep: 'course',
      currentCourse: null,
      selectedChapterId: null,
      isLoading: false,
      error: null,
    }),

  generateId,
}));
