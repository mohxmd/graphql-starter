import type { YogaInitialContext } from "graphql-yoga";
import { db } from "@/db";
import { type TokenPayload, verifyJwt } from "@/lib/auth/jwt";
import { GraphQLException } from "@/lib/error/exceptions";
import { createTaskLoader } from "./modules/task/task.loader";

export interface Context extends YogaInitialContext {
  db: typeof db;
  user: TokenPayload | null;
  loaders: {
    taskLoader: ReturnType<typeof createTaskLoader>;
  };
  requireAuth: () => TokenPayload;
  requireRole: (role: "USER" | "ADMIN") => TokenPayload;
}

export const createContext = async (
  initialContext: YogaInitialContext
): Promise<Context> => {
  let user: TokenPayload | null = null;

  try {
    const authHeader = initialContext.request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      user = await verifyJwt(token);
    }
  } catch (_error) {
    // Non-blocking: Allows public queries if needed
  }

  const loaders = {
    taskLoader: createTaskLoader(),
  };

  const requireAuth = (): TokenPayload => {
    if (!user) {
      throw GraphQLException.unauthenticated(
        "Authentication required to perform this action"
      );
    }
    return user;
  };

  const requireRole = (role: "USER" | "ADMIN"): TokenPayload => {
    const authenticatedUser = requireAuth();
    if (authenticatedUser.role !== role && authenticatedUser.role !== "ADMIN") {
      throw GraphQLException.forbidden(`Requires "${role}" role`);
    }
    return authenticatedUser;
  };

  return {
    ...initialContext,
    db,
    user,
    loaders,
    requireAuth,
    requireRole,
  };
};
