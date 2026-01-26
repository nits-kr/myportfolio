import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import contentReducer from "./slices/contentSlice";
import { apiSlice } from "./services/apiSlice";
import { portfolioApi } from "./services/portfolioApi";
import { subUserApi } from "./services/subUserApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [portfolioApi.reducerPath]: portfolioApi.reducer,
    [subUserApi.reducerPath]: subUserApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(portfolioApi.middleware)
      .concat(subUserApi.middleware),
});
