import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { authService } from "@/lib/auth-service";
import type { User } from "@/lib/types";
import type { LoginRequest, RegisterRequest } from "@/lib/auth-service";
import { useRouter } from '@tanstack/react-router';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const isAuthenticated = useMemo(() => {
    console.log('AuthContext Render: isAuthenticated:', !!(user && accessToken), 
                'accessToken:', accessToken ? 'PRESENT' : 'MISSING', 
                'user:', user ? 'PRESENT' : 'MISSING');
    return !!(user && accessToken);
  }, [user, accessToken]);

  // Initialize auth state from service
  useEffect(() => {
    const initializeAuth = () => {
      const token = authService.getAccessToken();
      const currentUser = authService.getCurrentUser();
      
      console.log('AuthContext: initializeAuth - token:', token ? 'PRESENT' : 'MISSING');
      console.log('AuthContext: initializeAuth - user:', currentUser ? 'PRESENT' : 'MISSING');

      setAccessToken(token);
      setUser(currentUser);
      setIsLoading(false);
    };

    initializeAuth();
    
    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = () => {
      console.log('AuthContext: Storage change detected');
      setAccessToken(authService.getAccessToken());
      setUser(authService.getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, accessToken: newAccessToken } = await authService.login(credentials);
      setUser(loggedInUser);
      setAccessToken(newAccessToken);
      
      router.navigate({ to: authService.getRedirectPath(loggedInUser.role) });
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const { user: registeredUser, accessToken: newAccessToken } = await authService.register(data);
      setUser(registeredUser);
      setAccessToken(newAccessToken);
      
      router.navigate({ to: authService.getRedirectPath(registeredUser.role) });
      return registeredUser;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAccessToken(null);
    router.navigate({ to: '/auth/signin' });
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setAccessToken(authService.getAccessToken());
    } catch (err) {
      console.warn('AuthContext: refreshUser failed, logging out:', err);
      logout();
    }
  }, [logout]);

  const value = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    setUser,
  }), [
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    setUser
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}