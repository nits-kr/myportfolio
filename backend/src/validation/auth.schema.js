import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(60, "Name cannot be more than 60 characters"),
    email: z.string().email("Please provide a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase, one lowercase, one number, and one special character",
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const sendOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
  }),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"), // Assuming 6 digit OTP
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase, one lowercase, one number, and one special character",
      ),
  }),
});
