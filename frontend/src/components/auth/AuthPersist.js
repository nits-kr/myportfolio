'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout } from '@/store/slices/authSlice';
import { useGetMeQuery } from '@/store/services/portfolioApi';

export default function AuthPersist({ children }) {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Check for user session using cookie
    // skip: false ensures it runs on mount
    const { data: userData, isError } = useGetMeQuery(undefined, {
        skip: false,
        pollingInterval: 0, // Disable polling, checking once on mount is usually enough
        refetchOnMountOrArgChange: true
    });

    useEffect(() => {
        // 1. On mount, check localStorage first for instant UI feedback
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser && !isAuthenticated) {
            dispatch(setUser(JSON.parse(storedUser)));
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        // 2. Sync with server data (source of truth)
        if (userData && userData.data) {
            // Update redux and localStorage with fresh data
            dispatch(setUser(userData.data));
            localStorage.setItem('userInfo', JSON.stringify(userData.data));
        } else if (isError) {
            // If server says unauthorized, clear everything
            dispatch(logout());
            localStorage.removeItem('userInfo');
        }
    }, [userData, isError, dispatch]);

    return children;
}
