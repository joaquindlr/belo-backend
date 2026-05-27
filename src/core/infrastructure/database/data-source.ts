import "dotenv/config";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "belo-db",
  synchronize: true,
  logging: false,
  entities: [__dirname + "/../../../**/*.entity{.ts,.js}"],
  subscribers: [],
  migrations: [],
});
