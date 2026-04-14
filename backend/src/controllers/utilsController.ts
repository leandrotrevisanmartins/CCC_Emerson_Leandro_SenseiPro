import { Request, Response } from "express";
import { appDataSource } from "../data-source";

export class UtilsController {
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const dbOnline = appDataSource.isInitialized;
      res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbOnline ? "conectado" : "desconectado",
      });
    } catch (error) {
      res.status(503).json({ status: "ERROR", message: "Serviço indisponível." });
    }
  };
}
