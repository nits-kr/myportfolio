"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/store/services/portfolioApi";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();
  const [registerUser, { isLoading: isRegisterLoading, error: registerError }] =
    useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    reset();
  }, [isLogin, reset]);

  const onSubmit = async (data) => {
    try {
      let result;
      if (isLogin) {
        result = await login({
          email: data.email,
          password: data.password,
        }).unwrap();
      } else {
        result = await registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || "user",
        }).unwrap();
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Auth failed:", err);
    }
  };

  const error = isLogin ? loginError : registerError;
  const isLoading = isLogin ? isLoginLoading : isRegisterLoading;
  const errorMessage =
    error?.data?.message || error?.error || "Authentication failed";

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-md-5"
      >
        <div className="glass-card p-5">
          <h2 className="text-center fw-bold mb-4">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          {error && (
            <div className="alert alert-danger fade show" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <label className="form-label text-muted">Full Name</label>
                  <input
                    type="text"
                    suppressHydrationWarning
                    className={`form-control bg-transparent border-secondary ${errors.name ? "is-invalid" : ""}`}
                    placeholder="John Doe"
                    {...register("name", {
                      required: !isLogin ? "Name is required" : false,
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name.message}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-3">
              <label className="form-label text-muted">Email Address</label>
              <input
                type="email"
                suppressHydrationWarning
                className={`form-control bg-transparent border-secondary ${errors.email ? "is-invalid" : ""}`}
                placeholder="admin@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label text-muted">Password</label>
              <input
                type="password"
                suppressHydrationWarning
                className={`form-control bg-transparent border-secondary ${errors.password ? "is-invalid" : ""}`}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            {isLogin && (
              <div className="d-flex justify-content-end mb-4">
                <Link
                  href="/forgot-password"
                  className="text-muted small text-decoration-none hover-primary transition"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <label className="form-label text-muted">Role</label>
                  <select
                    className="form-select bg-transparent border-secondary"
                    suppressHydrationWarning
                    {...register("role")}
                  >
                    <option value="user" className="text-dark">
                      User
                    </option>
                    <option value="admin" className="text-dark">
                      Admin
                    </option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="btn btn-premium w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : null}
              {isLoading
                ? "Processing..."
                : isLogin
                  ? "Access Dashboard"
                  : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-4 d-none">
            <p className="mb-0 text-muted">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="btn btn-link p-0 text-decoration-none text-primary fw-bold"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
