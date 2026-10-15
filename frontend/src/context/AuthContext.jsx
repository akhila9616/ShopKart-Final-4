import { createContext, useContext, useState, useEffect } from "react";
import { getMe, loginCustomer, logoutCustomer, registerCustomer } from "../services/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // null = unknown/guest, object = logged in
  const [authLoading, setAuthLoading] = useState(true); // true while checking session on startup

  // On first load: silently check if the cookie session is still valid
  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))     // no valid session — stay as guest
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginCustomer({ email, password });
    setUser(res.data.customer);
    return res.data;
  };

  const register = async (fullName, email, password, phone) => {
    const res = await registerCustomer({ fullName, email, password, phone });
    return res.data;
  };

  const logout = async () => {
    try { await logoutCustomer(); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
