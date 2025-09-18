// file: src/ts/pagination.types.ts
import type { Request } from "express";
import type { AggregatePaginateModel, Document, PaginateModel } from "mongoose";

export interface CustomLabels {
  totalDocs?: string;
  docs?: string;
  limit?: string;
  page?: string;
  nextPage?: string;
  prevPage?: string;
  totalPages?: string;
  pagingCounter?: string;
  hasPrevPage?: string;
  hasNextPage?: string;
  meta?: string;
}

export interface AggregatePaginateOptions {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: Record<string, number | "asc" | "desc">;
  customLabels?: CustomLabels;
  pagination?: boolean;
  allowDiskUse?: boolean;
  useFacet?: boolean;
  countQuery?: Record<string, any>;
}

export interface PaginateResult<T> {
  data?: T[];
  totalItems: number;
  itemsPerPage: number;
  currentPage?: number;
  pageCount: number;
  nextPage?: number | null;
  prevPage?: number | null;
  slNo: number;
  hasPrev: boolean;
  hasNext: boolean;
  meta?: any;
  [customLabel: string]: T[] | number | boolean | null | undefined;
}

export interface AggregatePaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

// Enhanced: Better typing for pagination queries
export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sort?: string;
  select?: string;
  populate?: string;
  search?: string;
  [key: string]: any;
}

export interface PaginatedRequest extends Request {
  query: PaginationQuery;
}

// Enhanced: More comprehensive response type
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  meta?: Record<string, any>;
  error?: string;
}

export type CombinedPaginateModel<T extends Document> = PaginateModel<T> & AggregatePaginateModel<T>;

// Additional utility types
export interface SearchableFields {
  [key: string]: string[];
}

export interface FilterOptions {
  searchFields?: string[];
  additionalFilters?: Record<string, any>;
  defaultSort?: Record<string, number | "asc" | "desc">;
}
