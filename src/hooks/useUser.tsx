import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type UserContextType = {
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
  isOnboarded: boolean;
  setOnboarded: (v: boolean) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("superset_user"));
  const [isOnboarded, setOnboarded] = useState(() => localStorage.getItem("superset_onboarded") === "true");

  const login = useCallback((id: string) => {
    localStorage.setItem("superset_user", id);
    setUserId(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("superset_user");
    localStorage.removeItem("superset_onboarded");
    setUserId(null);
    setOnboarded(false);
  }, []);

  const handleSetOnboarded = useCallback((v: boolean) => {
    localStorage.setItem("superset_onboarded", String(v));
    setOnboarded(v);
  }, []);

  return (
    <UserContext.Provider value={{ userId, login, logout, isOnboarded, setOnboarded: handleSetOnboarded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
