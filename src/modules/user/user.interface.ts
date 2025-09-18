import type { BaseDocument } from "@/utils/base-schema.utils";

export interface IUser extends BaseDocument {
  email: string;
  password: string;
  role: "golfer" | "golf_club" | "system_admin";
  isActive: boolean;
  handicapIndex?: number;
  isEmailVerified: boolean;
}
