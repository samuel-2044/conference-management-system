import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organiser" | "speaker" | "attendee";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "attendee" | "speaker") => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role as User["role"],
          });
        }
      }
    } catch {
      // User not authenticated
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    setUser({
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as User["role"],
    });
  }, []);

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: "attendee" | "speaker",
  ) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Signup failed");
    }

    setUser({
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role as User["role"],
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Ignore network failures — the local session must still be cleared.
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; email?: string }) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to update profile");
    }

    setUser({
      id: result.data.id,
      name: result.data.name,
      email: result.data.email,
      role: result.data.role as User["role"],
    });
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    fetchMe,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}