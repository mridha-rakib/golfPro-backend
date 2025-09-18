import type { PaginateOptions, PopulateOptions } from "mongoose";

import type {
  AggregatePaginateOptions,
  AggregatePaginateResult,
  PaginatedResponse,
  PaginateResult,
  PaginationQuery,
} from "@/ts/pagination.types";

import { ErrorCodeEnum } from "@/enums/error-code.enum";
import { logger } from "@/middlewares/pino-logger";

import { BadRequestException } from "./app-error.utils";

export class PaginationHelper {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;

  static parsePaginationParams(query: PaginationQuery): PaginateOptions {
    const page = Math.max(1, Number.parseInt(String(query.page)) || this.DEFAULT_PAGE);

    const limit = Math.min(
      Math.max(1, Number.parseInt(String(query.limit)) || this.DEFAULT_LIMIT),
      this.MAX_LIMIT,
    );

    if (page > 10000) {
      throw new BadRequestException(
        "Page number too large",
        ErrorCodeEnum.PAGINATION_INVALID_PAGE,
      );
    }

    const sort = query.sort ? this.parseSortString(String(query.sort)) : { createdAt: -1 };
    const select = query.select ? String(query.select).trim() : "";
    const populate = query.populate ? this.parsePopulateString(String(query.populate)) : [];

    return {
      page,
      limit,
      sort,
      select,
      populate: populate.length > 0 ? populate : undefined,
    };
  }

  static parseSortString(sortString: string): Record<string, number | "asc" | "desc"> {
    if (!sortString?.trim()) {
      return { createdAt: -1 };
    }

    const sortObj: Record<string, number | "asc" | "desc"> = {};
    const fields = sortString.split(",").map(field => field.trim()).filter(Boolean);

    for (const field of fields) {
      if (field.startsWith("-")) {
        const fieldName = field.substring(1);
        if (fieldName) {
          sortObj[fieldName] = -1;
        }
      }
      else if (field) {
        sortObj[field] = 1;
      }
    }

    return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
  }

  static parsePopulateString(populateString: string): PopulateOptions[] {
    if (!populateString?.trim()) {
      return [];
    }

    return populateString
      .split(",")
      .map(field => field.trim())
      .filter(Boolean)
      .map((field) => {
        // Support nested populate like "user.profile"
        const parts = field.split(".");
        if (parts.length > 1) {
          return {
            path: parts[0],
            populate: { path: parts.slice(1).join(".") },
          };
        }
        return { path: field };
      });
  }

  static formatResponse<T>(
    paginateResult: PaginateResult<T> | AggregatePaginateResult<T>,
  ): PaginatedResponse<T> {
    return {
      success: true,
      data: paginateResult.data || [],
      pagination: {
        currentPage: paginateResult.currentPage ?? 1,
        totalPages: paginateResult.totalPages,
        totalItems: paginateResult.totalDocs,
        itemsPerPage: paginateResult.itemsPerPage,
        hasNext: paginateResult.hasNext,
        hasPrev: paginateResult.hasPrev,
        nextPage: paginateResult.nextPage ?? null,
        prevPage: paginateResult.prevPage ?? null,
      },
    };
  }

  static getAggregateOptions(query: PaginationQuery): AggregatePaginateOptions {
    const page = Math.max(1, Number.parseInt(String(query.page)) || this.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, Number.parseInt(String(query.limit)) || this.DEFAULT_LIMIT),
      this.MAX_LIMIT,
    );
    const sort = query.sort ? this.parseSortString(String(query.sort)) : { createdAt: -1 };

    return {
      page,
      limit,
      sort,
      allowDiskUse: true,
      useFacet: true,
    };
  }

  static createSearchFilter(
    query: PaginationQuery,
    searchFields: string[] = [],
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    // Add search functionality
    if (query.search?.trim() && searchFields.length > 0) {
      const searchTerm = String(query.search).trim();
      filter.$or = searchFields.map(field => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));
    }

    // Add other filters
    const excludedKeys = ["page", "limit", "sort", "select", "populate", "search"];

    Object.entries(query).forEach(([key, value]) => {
      if (!excludedKeys.includes(key) && value !== undefined && value !== null) {
        // Handle boolean strings
        if (typeof value === "string" && (value === "true" || value === "false")) {
          filter[key] = value === "true";
        }
        else {
          filter[key] = value;
        }
      }
    });

    return filter;
  }

  // Utility method for creating aggregation pipelines with search
  static createSearchPipeline(
    query: PaginationQuery,
    searchFields: string[] = [],
    additionalFilters: Record<string, any> = {},
  ): Array<Record<string, any>> {
    const pipeline: Array<Record<string, any>> = [];

    // Match stage
    const matchFilter = {
      ...this.createSearchFilter(query, searchFields),
      ...additionalFilters,
    };

    if (Object.keys(matchFilter).length > 0) {
      pipeline.push({ $match: matchFilter });
    }

    return pipeline;
  }
}
