import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[${new Date().toISOString()}] ${err.message}`);

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Erro interno do servidor." });
};

export default errorHandler;
