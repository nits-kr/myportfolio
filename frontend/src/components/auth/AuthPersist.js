"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "@/store/slices/authSlice";
import { useGetMeQuery } from "@/store/services/portfolioApi";

export default function AuthPersist({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data: userData, isError } = useGetMeQuery(undefined, {
    skip: false,
    pollingInterval: 0,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser && !isAuthenticated) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (userData && userData.data) {
      dispatch(setUser(userData.data));
      localStorage.setItem("userInfo", JSON.stringify(userData.data));
    } else if (isError) {
      dispatch(logout());
      localStorage.removeItem("userInfo");
    }
  }, [userData, isError, dispatch]);

  return children;
}
