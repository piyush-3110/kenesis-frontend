import { create } from "zustand";

export interface NotificationSettings {
  emailReports: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  website: string;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  phone: string;
  timezone: string;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  allowCourseRecommendations: boolean;
}

interface SettingsState {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  socialLinks: SocialLinks;
  privacy: PrivacySettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

interface SettingsActions {
  // Profile actions
  updateProfile: (updates: Partial<ProfileSettings>) => void;
  updateAvatar: (avatarUrl: string) => void;

  // Notification actions
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;

  // Social links actions
  updateSocialLinks: (updates: Partial<SocialLinks>) => void;
  updateSocialLink: (platform: keyof SocialLinks, url: string) => void;

  // Privacy actions
  updatePrivacy: (updates: Partial<PrivacySettings>) => void;

  // API actions
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetChanges: () => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

// Default/empty profile settings
const defaultProfileSettings: ProfileSettings = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  bio: "",
  avatar: "",
  coverImage: "",
  location: "",
  phone: "",
  timezone: "UTC",
};

// Mock data for development - will be replaced with real API data
const mockNotificationSettings: NotificationSettings = {
  emailReports: true,
  pushNotifications: true,
  soundEnabled: true,
  vibrationEnabled: false,
  marketingEmails: false,
  securityAlerts: true,
};

const mockPrivacySettings: PrivacySettings = {
  profileVisibility: "public",
  showEmail: false,
  showPhone: false,
  allowMessages: true,
  allowCourseRecommendations: true,
};

const initialState: SettingsState = {
  profile: defaultProfileSettings,
  notifications: mockNotificationSettings,
  socialLinks: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    website: "",
  },
  privacy: mockPrivacySettings,
  isLoading: false,
  isSaving: false,
  error: null,
  hasUnsavedChanges: false,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialState,

  // Profile actions
  updateProfile: (updates: Partial<ProfileSettings>) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
      hasUnsavedChanges: true,
    }));
  },

  updateAvatar: (avatarUrl: string) => {
    set((state) => ({
      profile: { ...state.profile, avatar: avatarUrl },
      hasUnsavedChanges: true,
    }));
  },

  // Notification actions
  updateNotifications: (updates: Partial<NotificationSettings>) => {
    set((state) => ({
      notifications: { ...state.notifications, ...updates },
      hasUnsavedChanges: true,
    }));
  },

  toggleNotification: (key: keyof NotificationSettings) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: !state.notifications[key],
      },
      hasUnsavedChanges: true,
    }));
  },

  // Social links actions
  updateSocialLinks: (updates: Partial<SocialLinks>) => {
    set((state) => ({
      socialLinks: { ...state.socialLinks, ...updates },
      hasUnsavedChanges: true,
    }));
  },

  updateSocialLink: (platform: keyof SocialLinks, url: string) => {
    set((state) => ({
      socialLinks: {
        ...state.socialLinks,
        [platform]: url,
      },
      hasUnsavedChanges: true,
    }));
  },

  // Privacy actions
  updatePrivacy: (updates: Partial<PrivacySettings>) => {
    set((state) => ({
      privacy: { ...state.privacy, ...updates },
      hasUnsavedChanges: true,
    }));
  },

  // API actions
  loadSettings: async () => {
    const { setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      // Get real user data from auth store
      const { useAuthStore } = await import("@/store/useAuthStore");
      const authUser = useAuthStore.getState().user;

      if (authUser) {
        // Map auth user to profile settings
        const profileSettings: ProfileSettings = {
          firstName: "", // API doesn't have firstName/lastName split yet
          lastName: "",
          displayName: authUser.username || "",
          email: authUser.email || "",
          bio: authUser.bio || "",
          avatar: "", // No avatar in API yet
          coverImage: "",
          location: "",
          phone: "",
          timezone: "UTC",
        };

        set({
          profile: profileSettings,
          isLoading: false,
          hasUnsavedChanges: false,
        });
      } else {
        // No user data, keep defaults
        set({
          isLoading: false,
          hasUnsavedChanges: false,
        });
      }
    } catch (error) {
      setError("Failed to load settings");
      console.error("Settings load error:", error);
      setLoading(false);
    }
  },

  saveSettings: async () => {
    const {
      setSaving,
      setError,
      profile,
      notifications,
      socialLinks,
      privacy,
    } = get();

    setSaving(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // In real implementation, you would send data to API here
      console.log("Saving settings:", {
        profile,
        notifications,
        socialLinks,
        privacy,
      });

      set({
        isSaving: false,
        hasUnsavedChanges: false,
      });

      return Promise.resolve();
    } catch (error) {
      setError("Failed to save settings");
      console.error("Settings save error:", error);
      setSaving(false);
      return Promise.reject(error);
    }
  },

  resetChanges: () => {
    set({
      profile: defaultProfileSettings,
      notifications: mockNotificationSettings,
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        website: "",
      },
      privacy: mockPrivacySettings,
      hasUnsavedChanges: false,
      error: null,
    });
  },

  // UI actions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setSaving: (saving: boolean) => {
    set({ isSaving: saving });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
