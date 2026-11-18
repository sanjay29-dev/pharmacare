
import {  createContext,useContext,useEffect,useState,} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("pharmacare_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      sessionStorage.removeItem("pharmacare_user");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("pharmacare_token")
  );

  function logout() {
    sessionStorage.removeItem("pharmacare_token");
    sessionStorage.removeItem("pharmacare_user");

    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener(
      "pharmacare:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "pharmacare:unauthorized",
        handleUnauthorized
      );
    };
  }, []);

  async function login(username, password) {
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    const data = response.data;

    const loggedInUser = {
      username: data.username,
      role: data.role,
    };

    sessionStorage.setItem("pharmacare_token", data.token);

    sessionStorage.setItem(
      "pharmacare_user",
      JSON.stringify(loggedInUser)
    );

    setToken(data.token);
    setUser(loggedInUser);

    return loggedInUser;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
