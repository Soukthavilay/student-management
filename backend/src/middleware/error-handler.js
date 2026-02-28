import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/http-error.js";

export function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, "Endpoint not found"));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed: " + JSON.stringify(error.flatten().fieldErrors),
      errors: error.flatten(),
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      message: error.message,
      details: error.details || null,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Duplicate value violates unique constraint",
        details: error.meta || null,
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Foreign key constraint failed",
        details: error.meta || null,
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Record not found",
        details: error.meta || null,
      });
    }
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error",
  });
}
