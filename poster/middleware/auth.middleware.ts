import { IncomingMessage, ServerResponse } from "http";
import { getUserFromSession } from "../utils/redis-session.ts";

export interface AuthenticatedRequest extends IncomingMessage {
  user?: any;
}

export type AuthMiddleware = (
  req: AuthenticatedRequest,
  res: ServerResponse,
  next: () => void
) => void;

/**
 * Authentication middleware that checks if user is authenticated
 * Adds user object to request if authenticated
 */
export const requireAuth: AuthMiddleware = async (req, res, next) => {
  try {
    const user = await getUserFromSession(req.headers.cookie);

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Authentication required" }));
    }

    // Attach user to request object for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

/**
 * Optional authentication middleware that adds user to request if available
 * Doesn't block the request if user is not authenticated
 */
export const optionalAuth: AuthMiddleware = async (req, res, next) => {
  try {
    const user = await getUserFromSession(req.headers.cookie);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Continue without user attached
    next();
  }
};
