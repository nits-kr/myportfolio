"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zodResolver";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import OtpInput from "@/components/auth/OtpInput";
import {
  useRegisterMutation,
  useSendEmailVerificationOtpMutation,
  useVerifyEmailVerificationOtpMutation,
} from "@/store/services/portfolioApi";

const REGISTER_OTP_SECONDS = 300;

const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters").max(60),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must include uppercase, lowercase, number, and symbol",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

const safeRedirect = (value) => {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const redirectParam = searchParams.get("redirect");
  const redirectTo = safeRedirect(redirectParam);

  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [emailForOtp, setEmailForOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerStart, { isLoading: isRegistering, error: registerError }] =
    useRegisterMutation();
  const [resendOtp, { isLoading: isResending, error: resendError }] =
    useSendEmailVerificationOtpMutation();
  const [verifyOtp, { isLoading: isVerifying, error: verifyError }] =
    useVerifyEmailVerificationOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const {
    control,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtpForm,
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });

  const startTimer = () => {
    const expiry = Date.now() + REGISTER_OTP_SECONDS * 1000;
    localStorage.setItem("registerOtpExpiry", String(expiry));
    setTimeLeft(REGISTER_OTP_SECONDS);
  };

  useEffect(() => {
    const savedExpiry = localStorage.getItem("registerOtpExpiry");
    if (!savedExpiry) return;

    const remaining = Math.ceil((Number(savedExpiry) - Date.now()) / 1000);
    if (remaining > 0) setTimeLeft(remaining);
    else localStorage.removeItem("registerOtpExpiry");
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem("registerOtpExpiry");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const errorMessage = useMemo(() => {
    if (step === 1) {
      return registerError?.data?.message || registerError?.error || "";
    }
    const e = verifyError || resendError;
    return e?.data?.message || e?.error || "";
  }, [step, verifyError, resendError, registerError]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const stepParam = searchParams.get("step");
    if (emailParam) {
      setEmailForOtp(emailParam);
      if (stepParam === "2") setStep(2);
    }
  }, [searchParams]);

  const onRegister = async (data) => {
    try {
      await registerStart({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      setEmailForOtp(data.email);
      resetOtpForm({ otp: "" });
      startTimer();
      setStep(2);
    } catch (err) {
      if (err?.data?.message?.includes("not verified")) {
        setEmailForOtp(data.email);
      }
      throw err;
    }
  };

  const handleResendUnverified = async () => {
    try {
      await resendOtp({ email: emailForOtp }).unwrap();
      resetOtpForm({ otp: "" });
      startTimer();
      setStep(2);
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  const onVerify = async (data) => {
    await verifyOtp({ email: emailForOtp, otp: data.otp }).unwrap();
    localStorage.removeItem("registerOtpExpiry");

    if (redirectTo) router.push(redirectTo);
    else if (plan) router.push(`/pricing?plan=${encodeURIComponent(plan)}`);
    else router.push("/dashboard");
  };

  const onResend = async () => {
    if (timeLeft > 0) return;
    await resendOtp({ email: emailForOtp }).unwrap();
    resetOtpForm({ otp: "" });
    startTimer();
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-md-6 col-lg-5"
      >
        <div className="glass-card p-5 position-relative z-3">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p className="text-muted small mb-0">
              {step === 1
                ? "Create your account and verify your email to continue."
                : `Enter the 6-digit code sent to ${emailForOtp}`}
            </p>
          </div>

          {errorMessage ? (
            <div className="alert alert-danger py-2 text-center" role="alert">
              <div>{errorMessage}</div>
              {errorMessage.includes("not verified") && (
                <button
                  onClick={handleResendUnverified}
                  className="btn btn-link btn-sm p-0 mt-1 fw-bold text-danger text-decoration-none"
                  disabled={isResending}
                >
                  {isResending ? "Resending..." : "Resend code and verify now"}
                </button>
              )}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleSubmit(onRegister)} noValidate>
                  <div className="mb-3">
                    <label className="form-label text-muted">Full Name</label>
                    <input
                      suppressHydrationWarning
                      className={`form-control bg-transparent border-secondary ${errors.name ? "is-invalid" : ""}`}
                      placeholder="John Doe"
                      {...register("name")}
                    />
                    {errors.name ? (
                      <div className="invalid-feedback">
                        {errors.name.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted">
                      Email Address
                    </label>
                    <input
                      type="email"
                      suppressHydrationWarning
                      className={`form-control bg-transparent border-secondary ${errors.email ? "is-invalid" : ""}`}
                      placeholder="you@example.com"
                      {...register("email")}
                    />
                    {errors.email ? (
                      <div className="invalid-feedback">
                        {errors.email.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        suppressHydrationWarning
                        className={`form-control bg-transparent border-secondary pe-5 ${errors.password ? "is-invalid" : ""}`}
                        placeholder="••••••••"
                        {...register("password")}
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
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password ? (
                      <div className="invalid-feedback d-block">
                        {errors.password.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted">
                      Confirm Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        suppressHydrationWarning
                        className={`form-control bg-transparent border-secondary pe-5 ${errors.confirmPassword ? "is-invalid" : ""}`}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute translate-middle-y text-muted p-0 text-decoration-none"
                        style={{
                          right: errors.confirmPassword ? "2.8rem" : "1rem",
                          top: "50%",
                          zIndex: 10,
                        }}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword ? (
                      <div className="invalid-feedback d-block">
                        {errors.confirmPassword.message}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="btn btn-premium w-100"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : null}
                    {isRegistering ? "Sending code..." : "Create Account"}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="mb-0 text-muted small">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary fw-bold text-decoration-none"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleSubmitOtp(onVerify)} noValidate>
                  <div className="mb-3">
                    <Controller
                      name="otp"
                      control={control}
                      render={({ field }) => (
                        <OtpInput
                          value={field.value}
                          onChange={field.onChange}
                          autoFocus
                          disabled={isVerifying}
                        />
                      )}
                    />
                    {otpErrors.otp ? (
                      <div className="text-danger text-center small mt-2">
                        {otpErrors.otp.message}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-premium w-100"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : null}
                    {isVerifying ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => {
                      setStep(1);
                      localStorage.removeItem("registerOtpExpiry");
                      setTimeLeft(0);
                    }}
                    disabled={isVerifying || isResending}
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={onResend}
                    disabled={isVerifying || isResending || timeLeft > 0}
                    aria-disabled={isVerifying || isResending || timeLeft > 0}
                  >
                    {timeLeft > 0
                      ? `Resend in ${formatTime()}`
                      : isResending
                        ? "Resending..."
                        : "Resend code"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
