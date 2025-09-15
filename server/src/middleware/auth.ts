// server/src/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to enforce authentication on protected routes.
 * Checks for a valid JWT token in the request cookies.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Extract the token from the cookies
  const token = req.cookies?.token;

  // If no token is found, respond with a 401 Unauthorized error
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Verify the token using the secret key and extract the payload
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    // Attach the payload to the request object for downstream use
    (req as any).auth = payload;

    // Call the next middleware or route handler
    next();
  } catch {
    // If token verification fails, respond with a 401 Unauthorized error
    res.status(401).json({ error: "Unauthorized" });
  }
}
