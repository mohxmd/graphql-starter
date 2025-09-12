import type { YogaInitialContext } from "graphql-yoga";
import { db } from "@/db";

export interface Context extends YogaInitialContext {
  db: typeof db;
  user?: {
    id: string;
    email: string;
  };
}

export const createContext = async (
  initialContext: YogaInitialContext
): Promise<Context> => {
  let user: Context["user"];

  try {
    // Extract token from Authorization header
    const authorization = initialContext.request.headers.get("authorization");

    if (authorization) {
      user = {
        id: "ea3e2eb4-d887-43f2-96f2-d0215640fa42",
        email: "eren@example.com",
      };
    }
  } catch (error) {
    // Don't throw here - let resolvers handle auth requirements
    // This allows public queries if needed
    console.log("Authentication failed:", error);
  }

  return {
    ...initialContext,
    db,
    user,
  };
};
