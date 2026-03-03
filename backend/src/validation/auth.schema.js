import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    "Password must contain at least one uppercase, one lowercase, one number, and one special character",
  );

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(60, "Name cannot be more than 60 characters"),
    email: z.string().email("Please provide a valid email address"),
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const sendEmailVerificationOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
  }),
});

export const verifyEmailVerificationOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  }),
});

export const sendPasswordResetOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
  }),
});

export const verifyPasswordResetOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
  }),
});
