import { GraphQLError } from "graphql";

export type ErrorCode =
  | "BAD_USER_INPUT"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "GRAPHQL_PARSE_FAILED"
  | "GRAPHQL_VALIDATION_FAILED";

export class GraphQLException extends GraphQLError {
  public readonly code: ErrorCode;
  public readonly cause?: Error;

  constructor(code: ErrorCode, options?: { message?: string; cause?: Error }) {
    const message = options?.message || getDefaultMessage(code);

    super(message, {
      extensions: { code },
    });

    this.code = code;
    this.cause = options?.cause;
    this.name = "GraphQLException";
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
