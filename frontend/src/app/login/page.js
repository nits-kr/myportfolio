"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginMutation } from "@/store/services/portfolioApi";

const safeRedirect = (value) => {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const planParam = searchParams.get("plan");
  const showRegisterHint = searchParams.get("register") === "1";

  const redirectTo = useMemo(
    () => safeRedirect(redirectParam) || "/dashboard",
    [redirectParam],
  );

  const registerLink = useMemo(() => {
    const params = new URLSearchParams();
    const safe = safeRedirect(redirectParam);
    if (safe) params.set("redirect", safe);
    if (planParam) params.set("plan", planParam);
    const qs = params.toString();
    return qs ? `/register?${qs}` : "/register";
  }, [redirectParam, planParam]);

  const [submitError, setSubmitError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const errorMessage =
    submitError ||
    error?.data?.message ||
    error?.error ||
    "Authentication failed";

  const onSubmit = async (data) => {
    try {
      setSubmitError("");
      setUnverifiedEmail("");
      await login({ email: data.email, password: data.password }).unwrap();
      router.push(redirectTo);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        (err?.status
          ? `Authentication failed (${err.status})`
          : "Authentication failed");

      setSubmitError(message);
      if (message.includes("not verified")) {
        setUnverifiedEmail(data.email || getValues("email"));
      }
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-md-5"
      >
        <div className="glass-card p-5 position-relative z-3">
          <h2 className="text-center fw-bold mb-4">Welcome Back</h2>

          {showRegisterHint ? (
            <div className="alert alert-info py-2 text-center" role="alert">
              Login to continue — or{" "}
              <Link
                href={registerLink}
                className="fw-bold text-decoration-none"
              >
                create an account
              </Link>
              .
            </div>
          ) : null}

          {(error || submitError) && (
            <div
              className="alert alert-danger fade show text-center py-2"
              role="alert"
            >
              <div>{errorMessage}</div>
              {unverifiedEmail && (
                <Link
                  href={`/register?email=${encodeURIComponent(unverifiedEmail)}&step=2`}
                  className="btn btn-link btn-sm p-0 fw-bold text-danger text-decoration-none mt-1"
                >
                  Verify your account now
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
            <div className="mb-3">
              <label className="form-label text-muted">Email Address</label>
              <input
                type="email"
                suppressHydrationWarning
                className={`form-control bg-transparent border-secondary ${errors.email ? "is-invalid" : ""}`}
                placeholder="name@example.com"
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
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  suppressHydrationWarning
                  className={`form-control bg-transparent border-secondary pe-5 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  className="btn btn-link position-absolute translate-middle-y text-muted p-0 text-decoration-none"
                  style={{
                    right: errors.password ? "2.8rem" : "1rem",
                    top: "50%",
                    zIndex: 10,
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block">
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end mb-4">
              <Link
                href="/forgot-password"
                className="text-muted small text-decoration-none hover-primary transition"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              className="btn btn-premium w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              ) : null}
              {isLoading ? "Processing..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="mb-0 text-muted small">
              Don&apos;t have an account?{" "}
              <Link
                href={registerLink}
                className="text-primary fw-bold text-decoration-none"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
