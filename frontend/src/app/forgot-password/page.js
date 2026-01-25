"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/store/services/portfolioApi";
import Link from "next/link";
import { FaArrowLeft, FaEnvelope, FaLock, FaKey } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState(null); // Could be used if backend returns a token, otherwise we use email/otp

  // API Mutations
  const [sendOtp, { isLoading: isSendingOtp, error: sendOtpError }] =
    useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp, error: verifyOtpError }] =
    useVerifyOtpMutation();
  const [resetPassword, { isLoading: isResetting, error: resetError }] =
    useResetPasswordMutation();

  // Forms
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm();

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm();

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch,
    formState: { errors: resetErrors },
  } = useForm();

  // Handlers
  const onSendOtp = async (data) => {
    try {
      await sendOtp({ email: data.email }).unwrap();
      setEmail(data.email);
      setStep(2);
    } catch (err) {
      console.error("Failed to send OTP", err);
    }
  };

  const onVerifyOtp = async (data) => {
    try {
      await verifyOtp({ email, otp: data.otp }).unwrap();
      // If verification is successful, move to reset password
      setStep(3);
    } catch (err) {
      console.error("Failed to verify OTP", err);
    }
  };

  const onResetPassword = async (data) => {
    try {
      await resetPassword({ email, password: data.newPassword }).unwrap();
      // Redirect to login or show success message
      // For now, let's redirect to login for simplicity
      router.push("/login?reset=success");
    } catch (err) {
      console.error("Failed to reset password", err);
    }
  };

  // Render Helpers
  const renderError = (error) => {
    const msg = error?.data?.message || error?.error || "An error occurred";
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="alert alert-danger py-2 text-center"
        role="alert"
      >
        {msg}
      </motion.div>
    );
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-md-5 col-lg-4"
      >
        <div className="glass-card p-5 position-relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Reset Password"}
            </h2>
            <p className="text-muted small">
              {step === 1 && "Enter your email to receive a verification code."}
              {step === 2 && `Enter the code sent to ${email}`}
              {step === 3 && "Create a strong new password."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: SEND OTP */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmitEmail(onSendOtp)}
              >
                {sendOtpError && renderError(sendOtpError)}

                <div className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-muted">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      className={`form-control bg-transparent border-start-0 border-secondary ${emailErrors.email ? "is-invalid" : ""}`}
                      placeholder="name@example.com"
                      {...registerEmail("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                  </div>
                  {emailErrors.email && (
                    <div className="text-danger small mt-1 ps-1">
                      {emailErrors.email.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-premium w-100 mb-3"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </motion.form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmitOtp(onVerifyOtp)}
              >
                {verifyOtpError && renderError(verifyOtpError)}

                <div className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-muted">
                      <FaKey />
                    </span>
                    <input
                      type="text"
                      className={`form-control bg-transparent border-start-0 border-secondary ${otpErrors.otp ? "is-invalid" : ""}`}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      {...registerOtp("otp", {
                        required: "OTP is required",
                        minLength: {
                          value: 6,
                          message: "OTP must be 6 digits",
                        },
                        maxLength: {
                          value: 6,
                          message: "OTP must be 6 digits",
                        },
                      })}
                    />
                  </div>
                  {otpErrors.otp && (
                    <div className="text-danger small mt-1 ps-1">
                      {otpErrors.otp.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-premium w-100 mb-3"
                  disabled={isVerifyingOtp}
                >
                  {isVerifyingOtp ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link text-muted text-decoration-none small"
                    onClick={() => setStep(1)}
                  >
                    Resend Code?
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmitReset(onResetPassword)}
              >
                {resetError && renderError(resetError)}

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-muted">
                      <FaLock />
                    </span>
                    <input
                      type="password"
                      className={`form-control bg-transparent border-start-0 border-secondary ${resetErrors.newPassword ? "is-invalid" : ""}`}
                      placeholder="New Password"
                      {...registerReset("newPassword", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "At least 6 characters",
                        },
                      })}
                    />
                  </div>
                  {resetErrors.newPassword && (
                    <div className="text-danger small mt-1 ps-1">
                      {resetErrors.newPassword.message}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-muted">
                      <FaLock />
                    </span>
                    <input
                      type="password"
                      className={`form-control bg-transparent border-start-0 border-secondary ${resetErrors.confirmPassword ? "is-invalid" : ""}`}
                      placeholder="Confirm Password"
                      {...registerReset("confirmPassword", {
                        validate: (val) => {
                          if (watch("newPassword") !== val) {
                            return "Passwords do not match";
                          }
                        },
                      })}
                    />
                  </div>
                  {resetErrors.confirmPassword && (
                    <div className="text-danger small mt-1 ps-1">
                      {resetErrors.confirmPassword.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-premium w-100 mb-3"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="text-center mt-3 pt-3 border-top border-secondary border-opacity-10">
            <Link
              href="/login"
              className="text-decoration-none text-muted d-inline-flex align-items-center gap-2 hover-primary transition"
            >
              <FaArrowLeft size={12} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
