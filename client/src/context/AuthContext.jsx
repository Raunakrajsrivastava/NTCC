import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const TOKEN_KEY = 'arch_advisor_token';
const USER_KEY = 'arch_advisor_user';

// ─── State & Reducer ───────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isAuthenticated: false,
  isLoading: true, // true on init so we can try loadUser before rendering
};

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    default:
      return state;
  }
};

// ─── Context ───────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist token & user to localStorage when they change
  useEffect(() => {
    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, [state.token]);

  // On mount — try to restore session from stored token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }
    try {
      const data = await authService.getMe();
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: data.user });
    } catch {
      // Token is invalid or expired — clear it
      localStorage.removeItem(TOKEN_KEY);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ─── Actions ────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors — always clear local state
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
