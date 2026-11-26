import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

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

function toUser(data: { id: string; name: string; email: string; role: string }): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as User["role"],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(toUser(data.data));
          return;
        }
      }