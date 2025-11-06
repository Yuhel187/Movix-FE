"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

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
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (user: AuthUser, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [token, _setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        _setToken(storedToken); 
        _setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: AuthUser | null) => {
    _setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("user");
      }
    }
  };

  const setToken = (newToken: string | null) => {
    _setToken(newToken);
    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem("accessToken", newToken);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  };

  const login = (user: AuthUser, token: string, refreshToken: string) => {
    setUser(user);   
    setToken(token); 
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setUser(null);   
    setToken(null); 
    localStorage.removeItem("refreshToken");
    router.push("/");
  };
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout, 
      isLoggedIn, 
      setUser, 
      setToken 
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