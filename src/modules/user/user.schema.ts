import { z } from "zod";

import { emailGeneric, objectIdGeneric } from "@/utils/schema-generic.utils";

export const UserRoleEnum = z.enum(["golfer", "golf_club", "system_admin"]);

export const userSchemaGeneric = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(4, "Password must be at least 4 characters"),
  // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

  role: UserRoleEnum,
  isActive: z.boolean().default(true).optional(),
  handicapIndex: z.number().min(0).max(54).optional(),
  isEmailVerified: z.boolean().default(false).optional(),
});

// Public user schema (without sensitive data)
export const publicUserSchema = userSchemaGeneric.omit({
  password: true,
});

// update user schema
export const updateUserSchema = z.object({
  body: userSchemaGeneric
    .partial()
    .omit({ email: true, password: true, role: true })
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
  params: z.object({
    id: objectIdGeneric,
  }),
});

// user password change schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  }),
  params: z.object({
    id: objectIdGeneric,
  }),
});

// get users schema
export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional(),
    sort: z.string().optional(),
    search: z.string().trim().min(1).optional(),
    role: UserRoleEnum.optional(),
    isActive: z.enum(["true", "false"]).transform(val => val === "true").optional(),
  }),
});

// get user schema
export const getUserByIdSchema = z.object({
  params: z.object({
    id: objectIdGeneric,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailGeneric.trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(4, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

// Change email schema (for authenticated users)
export const changeEmailSchema = z.object({
  body: z.object({
    newEmail: emailGeneric.trim(),
    password: z.string().min(1, "Current password is required"),
  }),
});
