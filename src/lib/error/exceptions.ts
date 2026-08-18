import { GraphQLError } from "graphql";

export type ErrorCode =
  | "BAD_USER_INPUT"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "TOO_MANY_REQUESTS"
  | "GRAPHQL_PARSE_FAILED"
  | "GRAPHQL_VALIDATION_FAILED";

const httpStatusMap: Record<ErrorCode, number> = {
  BAD_USER_INPUT: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  GRAPHQL_PARSE_FAILED: 400,
  GRAPHQL_VALIDATION_FAILED: 400,
};

export class GraphQLException extends GraphQLError {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly cause?: Error;

  constructor(
    code: ErrorCode,
    options?: {
      message?: string;
      cause?: Error;
      extensions?: Record<string, unknown>;
    }
  ) {
    const message = options?.message || getDefaultMessage(code);
    const httpStatus = httpStatusMap[code] || 500;

    super(message, {
      extensions: {
        code,
        http: { status: httpStatus },
        ...options?.extensions,
      },
    });

    this.code = code;
    this.httpStatus = httpStatus;
    this.cause = options?.cause;
    this.name = "GraphQLException";
  }

  // Factory Helper Methods
  static notFound(message = "Resource not found", cause?: Error) {
    return new GraphQLException("NOT_FOUND", { message, cause });
  }

  static badInput(
    message = "Bad user input",
    cause?: Error,
    extensions?: Record<string, unknown>
  ) {
    return new GraphQLException("BAD_USER_INPUT", {
      message,
      cause,
      extensions,
    });
  }

  static unauthenticated(message = "Authentication required", cause?: Error) {
    return new GraphQLException("UNAUTHENTICATED", { message, cause });
  }

  static forbidden(message = "Access forbidden", cause?: Error) {
    return new GraphQLException("FORBIDDEN", { message, cause });
  }

  static conflict(message = "Resource already exists", cause?: Error) {
    return new GraphQLException("CONFLICT", { message, cause });
  }

  static internal(message = "Internal server error", cause?: Error) {
    return new GraphQLException("INTERNAL_ERROR", { message, cause });
  }
}

function getDefaultMessage(code: ErrorCode): string {
  switch (code) {
    case "BAD_USER_INPUT":
      return "Bad user input";
    case "UNAUTHENTICATED":
      return "Authentication required";
    case "FORBIDDEN":
      return "Access forbidden";
    case "NOT_FOUND":
      return "Resource not found";
    case "CONFLICT":
      return "Resource conflict";
    case "TOO_MANY_REQUESTS":
      return "Too many requests. Please try again later";
    case "INTERNAL_ERROR":
      return "Internal server error";
    case "GRAPHQL_PARSE_FAILED":
      return "GraphQL parse error";
    case "GRAPHQL_VALIDATION_FAILED":
      return "GraphQL validation error";
    default:
      return "Unknown error";
  }
}
