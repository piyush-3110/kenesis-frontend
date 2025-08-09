export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: Array<{ field: string; message: string }>;
  retryAfter?: number;
};

export type User = {
  id: string;
  email: string;
  username: string;
  bio?: string;
  role: string;
  emailVerified: boolean;
  socialMedia: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
  walletAddress?: string;
  avatar?: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthPayload = {
  user: User;
  tokens: Tokens;
};
