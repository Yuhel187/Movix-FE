"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiClient from '@/lib/apiClient';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  display_name?: string;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeUser = (data: any): AuthUser => {
    if (!data) return data;
    const roleNormalized = (typeof data.role === 'object' && data.role !== null)
      ? data.role.name
      : data.role;

    return {
      ...data,
      role: roleNormalized,
      avatarUrl: data.avatar_url || data.avatarUrl || null
    };
  };

  const checkAuth = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await apiClient.get("/profile/me");
      const userSafe = normalizeUser(res.data);
      _setUser(userSafe);
      localStorage.setItem("user_cache", JSON.stringify(userSafe));
    } catch (error) {
      if (!isSilent) {
        _setUser(null);
        localStorage.removeItem("user_cache");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem("user_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const userSafe = normalizeUser(parsed);
          if (!user) _setUser(userSafe);
        } catch (e) {
          localStorage.removeItem("user_cache");
        }
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      console.log("🔄 Auto-refreshing session...");
      checkAuth(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user]);

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

  const login = (user: AuthUser) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (error) {
      console.error("Lỗi khi gọi API logout, nhưng vẫn đăng xuất client", error);
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