import { prisma } from "../lib/prisma.js";
import { unauthorized } from "../utils/http-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authRequired(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw unauthorized("Missing Bearer token");
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw unauthorized("User is inactive or not found");
    }

    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    return next(unauthorized("Invalid or expired token"));
  }
}
