import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Apenas em desenvolvimento — usar migrations em produção
  logging: false,
  entities: [__dirname + "/entities/*.{js,ts}"],
  migrations: [],
  subscribers: [],
});
