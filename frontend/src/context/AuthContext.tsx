
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

export interface UserPermission {
  module: string;
  action: string;
  moduleType: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: AuthUser;
    permissions?: UserPermission[];
  };
  token?: string;
  accessToken?: string;
  user?: AuthUser;
  permissions?: UserPermission[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  permissions: UserPermission[];
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasPermission: (
    module: string,
    action: string,
    moduleType: string
  ) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore saved login session from localStorage.
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("erp_token");
      const savedUser = localStorage.getItem("erp_user");
      const savedPermissions = localStorage.getItem("erp_permissions");

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser) as AuthUser;

        const parsedPermissions: UserPermission[] =
          savedPermissions
            ? (JSON.parse(savedPermissions) as UserPermission[])
            : [];

        // Intentional restoration of browser storage into React state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(savedToken);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPermissions(parsedPermissions);
      } else {
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_user");
        localStorage.removeItem("erp_permissions");
      }
    } catch {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
      localStorage.removeItem("erp_permissions");
    } finally {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<AuthUser> => {
      if (!API_URL) {
        throw new Error(
          "API URL is missing. Check frontend/.env.local."
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

      const authToken =
        result.data?.token || result.token || result.accessToken;

      const authUser = result.data?.user || result.user;

      const userPermissions =
        result.data?.permissions || result.permissions || [];

      if (!authToken || !authUser) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("erp_token", authToken);
      localStorage.setItem("erp_user", JSON.stringify(authUser));
      localStorage.setItem(
        "erp_permissions",
        JSON.stringify(userPermissions)
      );

      setToken(authToken);
      setUser(authUser);
      setPermissions(userPermissions);

      // Return logged-in user for role-based redirection.
      return authUser;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    localStorage.removeItem("erp_permissions");

    setToken(null);
    setUser(null);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback(
    (module: string, action: string, moduleType: string) => {
      if (user?.role === "super_admin") {
        return true;
      }

      return permissions.some(
        (permission) =>
          permission.module === module &&
          permission.action === action &&
          permission.moduleType === moduleType
      );
    },
    [user, permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
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
      "useAuth must be used within an AuthProvider."
    );
  }

  return context;
}
