import type { IUser } from "@/modules/user/user.interface";
import type { PaginatedResponse, PaginationQuery } from "@/ts/pagination.types";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { logger } from "@/middlewares/pino-logger";
import { BadRequestException, NotFoundException } from "@/utils/app-error.utils";
import { PaginationHelper } from "@/utils/pagination-helper";

import UserModel from "./user.model";

export class UserRepository {
  private readonly searchableFields = ["email"]; // Add more searchable fields as needed
  private readonly sortableFields = ["email", "role", "createdAt", "updatedAt", "isActive"];

  async getUsers(query: PaginationQuery): Promise<PaginatedResponse<IUser>> {
    const paginateOptions = PaginationHelper.parsePaginationParams(query);

    const searchFilter = PaginationHelper.createSearchFilter(
      query,
      this.searchableFields,
    );

    if (query.role && typeof query.role === "string") {
      const validRoles = ["golfer", "golf_club", "system_admin"];
      if (validRoles.includes(query.role)) {
        searchFilter.role = query.role;
      }
    }

    if (query.isActive !== undefined) {
      searchFilter.isActive = Boolean(query.isActive);
    }

    if (paginateOptions.sort) {
      const sortKeys = Object.keys(paginateOptions.sort);

      const invalidSortFields = sortKeys.filter(field => !this.sortableFields.includes(field));

      if (invalidSortFields.length > 0) {
        logger.warn(`Invalid sort fields: ${invalidSortFields.join(", ")}`);
        throw new BadRequestException(
          `Invalid sort fields: ${invalidSortFields.join(", ")}`,
          ErrorCodeEnum.PAGINATION_INVALID_SORT_FIELD,
        );
      }
    }

    logger.info({ query, searchFilter, paginateOptions }, "User repository query");

    if (query.isEmailVerified !== undefined) {
      searchFilter.isEmailVerified = query.isEmailVerified === "true" || query.isEmailVerified === true;
    }

    const result = await UserModel.paginate(searchFilter, {
      ...paginateOptions,
      lean: true,
      leanWithId: true,
      populate: paginateOptions.populate,
    });

    logger.info({ result }, "User repository result");

    return PaginationHelper.formatResponse(result);
  }

  async findUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ _id: userId, isActive: true }).lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await UserModel.findOne({ _id: userId, isActive: true }).lean();
    return !!user;
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  /**
   * Get user with password (for password change)
   */
  async getUserWithPassword(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ _id: userId, isActive: true })
      .select("+password")
      .lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<IUser> {
    return await this.updateUser(userId, { password: hashedPassword });
  }

  async updateEmailVerification(userId: string): Promise<IUser> {
    return await this.updateUser(userId, { isEmailVerified: true });
  }

  async validateUserStatus(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isActive) {
      throw new NotFoundException("User account is deactivated");
    }

    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }
}

export const userRepository = new UserRepository();
