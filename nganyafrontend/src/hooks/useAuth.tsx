import { createContext, useContext, useState, type ReactNode} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "customer" | "driver" | "admin";
}

interface AuthContextType {
  user: User | null;
  signIn: (
    email: string,
    password: string,
    type: "customer" | "driver" | "admin",
  ) => Promise<void>;
  signUp: (userData: Omit<User, "id"> & { password: string }) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (
    email: string,
    password: string,
    type: "customer" | "driver" | "admin",
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      type,
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const signUp = async (userData: Omit<User, "id"> & { password: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { password, ...userWithoutPassword } = userData;
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...userWithoutPassword,
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Initialize user from localStorage on mount
  useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
