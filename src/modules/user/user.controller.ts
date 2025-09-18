import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { logger } from "@/middlewares/pino-logger";
import { zParse } from "@/utils/validators.utils";

import type { ChangeEmailInput, ChangePasswordInput, ForgotPasswordInput, GetUserByIdInput, GetUsersInput, ResetPasswordInput, UpdateUserInput, VerifyEmailInput } from "./user.type";

import { changeEmailSchema, changePasswordSchema, forgotPasswordSchema, getUserByIdSchema, getUsersSchema, resetPasswordSchema, updateUserSchema, verifyEmailSchema } from "./user.schema";
import { userService } from "./user.service";

export class UserController {
  /**
   * Get paginated users
   * GET /users
   */
  getUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { query }: GetUsersInput = await zParse(getUsersSchema, req);
    const result = await userService.getUsers(query);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Get user by ID
   * GET /users/:id
   */
  getUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { params }: GetUserByIdInput = await zParse(getUserByIdSchema, req);

    const result = await userService.getUserById(params.id);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Update user profile
   * PATCH /users/:id
   */
  updateUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { params, body }: UpdateUserInput = await zParse(updateUserSchema, req);

    const result = await userService.updateUser(params.id, body);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Change user password
   * PATCH /users/:id/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { params, body }: ChangePasswordInput = await zParse(changePasswordSchema, req);

    const result = await userService.changePassword(params.id, body);

    return res.status(HTTPSTATUS.OK).json(result);
  });

  /**
   * Forgot password
   * POST /user/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: ForgotPasswordInput = await zParse(forgotPasswordSchema, req);
    logger.info(body);
    // TODO: Implement forgot password logic with email sending
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  });

  /**
   * Reset password
   * POST /user/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: ResetPasswordInput = await zParse(resetPasswordSchema, req);
    logger.info(body);
    // TODO: Implement reset password logic
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Password reset successfully",
    });
  });

  /**
   * Verify email
   * POST /user/verify-email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: VerifyEmailInput = await zParse(verifyEmailSchema, req);
    logger.info(body);
    // TODO: Implement email verification logic
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Email verified successfully",
    });
  });

  /**
   * Change email for authenticated user
   * POST /user/change-email
   */
  changeEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { body }: ChangeEmailInput = await zParse(changeEmailSchema, req);
    logger.info(body);
    // TODO: Implement change email logic
    // For now, return success message
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Email change request sent. Please verify your new email.",
    });
  });
}

export const userController = new UserController();
