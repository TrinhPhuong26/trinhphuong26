"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@prisma/client";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: File | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
