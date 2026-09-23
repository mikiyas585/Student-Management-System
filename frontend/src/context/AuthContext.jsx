import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(function () {
    const saved = localStorage.getItem("user");
    if (saved && saved !== "undefined") {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  function login(token, userData) {
    if (!token || !userData) {
      console.error("Invalid login data:", { token, userData });
      return;
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
