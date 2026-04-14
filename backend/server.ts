import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { appDataSource } from "./src/data-source";

const PORT = parseInt(process.env.API_PORT || "3001");

appDataSource
  .initialize()
  .then(() => {
    console.log("✅ Banco de dados conectado com sucesso.");
    app.listen(PORT, () => {
      console.log(`🚀 SenseiPro API rodando em http://localhost:${PORT}`);
      console.log(`📋 Healthcheck: http://localhost:${PORT}/api/healthcheck`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });
