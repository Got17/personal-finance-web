import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email address is required." })
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(1, { message: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    workspaceName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
