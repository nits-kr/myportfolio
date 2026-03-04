import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import contentReducer from "./slices/contentSlice";
import { apiSlice } from "./services/apiSlice";

/**
 * All API slices (portfolioApi, subUserApi, toolsApi, blogsApi, projectsApi)
 * are now injected into the single offline-aware apiSlice via injectEndpoints.
 * This means only one reducer path and one middleware needed.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
