import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

interface User {
  userId: string;
  email: string;
  publicKey: string;
}

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => void;
}>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      await api.get("/auth/profile");
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((res) => {
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
