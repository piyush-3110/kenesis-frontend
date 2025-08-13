import { create } from "zustand";
import {
  updateUserProfile,
  updateUserProfileWithFile,
  updateSocialMediaLinks,
  UpdateProfileRequest,
  UpdateSocialMediaRequest,
} from "../api/settingsApi";

export interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  website: string;
}

export interface ProfileSettings {
  displayName: string;
  email: string;
  bio: string;
  avatar: string;
}

interface SettingsState {
  profile: ProfileSettings;
  socialLinks: SocialLinks;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

interface SettingsActions {
  // Profile actions
  updateProfile: (updates: Partial<ProfileSettings>) => void;
  updateAvatar: (avatarUrl: string) => void;
  uploadAvatar: (file: File) => Promise<void>;

  // Social links actions
  updateSocialLinks: (updates: Partial<SocialLinks>) => void;
  updateSocialLink: (platform: keyof SocialLinks, url: string) => void;

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
  displayName: "",
  email: "",
  bio: "",
  avatar: "",
};

const initialState: SettingsState = {
  profile: defaultProfileSettings,
  socialLinks: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    website: "",
  },
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

  uploadAvatar: async (file: File) => {
    const { setError } = get();
    setError(null);

    try {
      const result = await updateUserProfileWithFile({ avatar: file });

      // Update the avatar URL in the store
      set((state) => ({
        profile: {
          ...state.profile,
          avatar: result.user.avatar || "",
        },
        hasUnsavedChanges: true, // Keep save button available for other potential changes
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload avatar";
      setError(errorMessage);
      console.error("Avatar upload error:", error);
      throw error;
    }
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

  // API actions
  loadSettings: async () => {
    const { setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Use default settings - user data will be populated by the component
      set({
        isLoading: false,
        hasUnsavedChanges: false,
      });
    } catch (error) {
      setError("Failed to load settings");
      console.error("Settings load error:", error);
      setLoading(false);
    }
  },

  saveSettings: async () => {
    const { setSaving, setError, profile, socialLinks } = get();

    setSaving(true);
    setError(null);

    try {
      // Check if we're updating social media links only or also profile data
      const hasProfileUpdates =
        profile.displayName.trim() || profile.bio.trim();
      const hasSocialUpdates = Object.values(socialLinks).some((link) =>
        link.trim()
      );

      let result;

      if (hasProfileUpdates && hasSocialUpdates) {
        // Update both profile and social media using JSON API
        const updateData: UpdateProfileRequest = {
          username: profile.displayName,
          bio: profile.bio,
          socialMedia: {
            twitter: socialLinks.twitter,
            linkedin: socialLinks.linkedin,
            facebook: socialLinks.facebook,
            instagram: socialLinks.instagram,
            website: socialLinks.website,
          },
        };

        console.log(
          "🔄 [SETTINGS] Updating profile and social media with JSON API:",
          updateData
        );
        result = await updateUserProfile(updateData);
      } else if (hasSocialUpdates) {
        // Update only social media links using dedicated API
        const socialData: UpdateSocialMediaRequest = {
          socialMedia: {
            twitter: socialLinks.twitter,
            linkedin: socialLinks.linkedin,
            facebook: socialLinks.facebook,
            instagram: socialLinks.instagram,
            website: socialLinks.website,
          },
        };

        console.log(
          "🔗 [SETTINGS] Updating social media links only:",
          socialData
        );
        result = await updateSocialMediaLinks(socialData);
      } else if (hasProfileUpdates) {
        // Update only profile data
        const profileData: UpdateProfileRequest = {
          username: profile.displayName,
          bio: profile.bio,
        };

        console.log("👤 [SETTINGS] Updating profile data only:", profileData);
        result = await updateUserProfile(profileData);
      } else {
        // No updates to save
        console.log("ℹ️ [SETTINGS] No changes to save");
        setSaving(false);
        return Promise.resolve();
      }

      console.log("✅ [SETTINGS] Profile updated successfully:", result);

      // Update the local state with the response data
      set((state) => ({
        profile: {
          ...state.profile,
          displayName: result.user.username || "",
          email: result.user.email || "",
          bio: result.user.bio || "",
          avatar: result.user.avatar || "",
        },
        socialLinks: {
          twitter: result.user.socialMedia?.twitter || "",
          linkedin: result.user.socialMedia?.linkedin || "",
          facebook: result.user.socialMedia?.facebook || "",
          instagram: result.user.socialMedia?.instagram || "",
          website: result.user.socialMedia?.website || "",
        },
        isSaving: false,
        hasUnsavedChanges: false,
      }));

      return Promise.resolve();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save settings";
      console.error("❌ [SETTINGS] Settings save error:", error);
      setError(errorMessage);
      setSaving(false);
      return Promise.reject(error);
    }
  },

  resetChanges: () => {
    set({
      profile: defaultProfileSettings,
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        website: "",
      },
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
