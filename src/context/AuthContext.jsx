import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { AUTH_STORAGE_KEY } from "../utils/constants";
import * as authApi from "../api/auth";

const AuthContext = createContext();

const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Invalid auth store", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const stored = getStoredAuth();
  const [token, setToken] = useState(stored?.token || null);
  const [user, setUser] = useState(stored?.user || null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(Boolean(token));

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (nextToken && nextUser) {
      const payload = { token: nextToken, user: nextUser };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
      setToken(nextToken);
      setUser(nextUser);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setInitializing(false);
      return;
    }
    try {
      const { user: profile } = await authApi.getProfile();
      persistAuth(token, profile);
    } catch (error) {
      console.error("Unable to fetch profile", error);
      persistAuth(null, null);
    } finally {
      setInitializing(false);
    }
  }, [persistAuth, token]);

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    } else {
      setInitializing(false);
    }
  }, [fetchProfile, token, user]);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const { token: nextToken, user: nextUser } = await authApi.login(
          credentials
        );
        persistAuth(nextToken, nextUser);
        return nextUser;
      } finally {
        setLoading(false);
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const { token: nextToken, user: nextUser } = await authApi.register(
          payload
        );
        persistAuth(nextToken, nextUser);
        return nextUser;
      } finally {
        setLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    persistAuth(null, null);
    window.location.replace("/login");
  }, [persistAuth]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const { user: profile } = await authApi.getProfile();
    persistAuth(token, profile);
    return profile;
  }, [persistAuth, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout,
      refreshProfile,
      loading,
      initializing,
      isAuthenticated: Boolean(token && user)
    }),
    [token, user, login, register, logout, refreshProfile, loading, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

