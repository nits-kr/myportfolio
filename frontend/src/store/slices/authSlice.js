import { createSlice } from "@reduxjs/toolkit";
import { portfolioApi } from "../services/portfolioApi";

const getUserFromStorage = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const initialState = {
  user: getUserFromStorage(),
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: !!getUserFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        portfolioApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.token = payload.token;
          state.isAuthenticated = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(payload.data));
            localStorage.setItem("token", payload.token);
          }
        },
      )
      .addMatcher(
        portfolioApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.token = payload.token;
          state.isAuthenticated = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(payload.data));
            localStorage.setItem("token", payload.token);
          }
        },
      )
      .addMatcher(
        portfolioApi.endpoints.getMe.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.isAuthenticated = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(payload.data));
          }
        },
      )
      .addMatcher(
        portfolioApi.endpoints.updateProfile.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(payload.data));
          }
        },
      );
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
