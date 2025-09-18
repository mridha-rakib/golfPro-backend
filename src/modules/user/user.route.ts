import { Router } from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware";

import { userController } from "./user.controller";

const router = Router();

router.get("/", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "system_admin"]), userController.getUsers);
router.get("/:id", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "system_admin"]), userController.getUserById);
router.patch("/:id", authMiddleware.authenticate, authMiddleware.authorize(["golfer", "golf_club", "system_admin"]), userController.updateUser);
router.patch("/:id/change-password", userController.changePassword);

// Password management
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Email management
router.post("/verify-email", userController.verifyEmail); // verify email
router.post("/change-email", userController.changeEmail); // Change email (TODO: Add auth middleware)

export default router;
