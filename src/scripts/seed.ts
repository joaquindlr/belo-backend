import "reflect-metadata";
import { AppDataSource } from "../core/infrastructure/database/data-source";
import { SeedDatabaseUseCase } from "../core/application/seed/seed-database.use-case";

async function runSeed() {
  if (process.env.NODE_ENV === "production") {
    console.warn("Seeding skipped: NODE_ENV is set to production.");
    process.exit(0);
  }

  try {
    console.log("Initializing data source");
    await AppDataSource.initialize();
    console.log("Data Source has been initialized");

    const seedUseCase = new SeedDatabaseUseCase();
    await seedUseCase.execute();

    console.log("Closing connection");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Error in seeding", error);
    process.exit(1);
  }
}

runSeed();
