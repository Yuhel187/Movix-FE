"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import apiClient from '@/lib/apiClient';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  display_name?: string;
  display_name_color?: string | null;
  preferences?: {
    onboarded_at?: string | null;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (data: any): AuthUser => {
  if (!data) return data;
  const roleNormalized = (typeof data.role === 'object' && data.role !== null)
    ? data.role.name
    : data.role;

  return {
    ...data,
    role: roleNormalized,
    avatarUrl: data.avatar_url || data.avatarUrl || null,
    display_name_color: data.display_name_color ?? null,
    preferences: data.preferences ?? null,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await apiClient.get("/profile/me");
      const userSafe = normalizeUser(res.data);
      _setUser(userSafe);
      localStorage.setItem("user_cache", JSON.stringify(userSafe));
    } catch {
      if (!isSilent) {
        _setUser(null);
        localStorage.removeItem("user_cache");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem("user_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const userSafe = normalizeUser(parsed);
          if (!user) _setUser(userSafe);
        } catch {
          localStorage.removeItem("user_cache");
        }
      }
    }
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      console.log("🔄 Auto-refreshing session...");
      checkAuth(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, checkAuth]);

  useEffect(() => {
    if (!isLoading && user) {
      const hasOnboarded = user.preferences?.onboarded_at || (user as any).onboarded_at || (user as any).onboardedAt;
      if (!hasOnboarded) {
        if (pathname !== '/onboarding' && pathname !== '/logout' && pathname !== '/') {
          router.push('/onboarding');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const setUser = (newUser: AuthUser | null) => {
    const userSafe = newUser ? normalizeUser(newUser) : null;
    _setUser(userSafe);
    if (typeof window !== 'undefined') {
      if (userSafe) {
        localStorage.setItem("user_cache", JSON.stringify(userSafe));
      } else {
        localStorage.removeItem("user_cache");
      }
    }
  };

  const login = async (user: AuthUser) => {
    await checkAuth();
  };

  const logout = async () => {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      await apiClient.post("/auth/logout", { refreshToken });
    } catch (error) {
      console.error("Lỗi khi gọi API logout, nhưng vẫn đăng xuất client", error);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isLoggedIn: !!user,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};