import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contentReducer from './slices/contentSlice';
import { portfolioApi } from './services/portfolioApi';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        content: contentReducer,
        [portfolioApi.reducerPath]: portfolioApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(portfolioApi.middleware),
});
