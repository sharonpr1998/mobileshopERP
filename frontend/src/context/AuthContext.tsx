
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuthUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: AuthUser;
  };
  token?: string;
  accessToken?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session saved in localStorage.
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("erp_token");
      const savedUser = localStorage.getItem("erp_user");

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser) as AuthUser;

        // Intentional state restoration from browser storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(savedToken);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);
      } else {
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_user");
      }
    } catch {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
    } finally {
      // Intentional completion of session initialization.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!API_URL) {
        throw new Error(
          "API URL is missing. Check frontend/.env.local.",
        );
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Login failed.");
      }

      // Backend response: { success, data: { token, user } }
      const authToken =
        result.data?.token || result.token || result.accessToken;

      const authUser = result.data?.user || result.user;

      if (!authToken || !authUser) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("erp_token", authToken);
      localStorage.setItem("erp_user", JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");

    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider.",
    );
  }

  return context;
}
