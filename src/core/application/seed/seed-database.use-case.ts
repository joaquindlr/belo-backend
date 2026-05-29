import { AppDataSource } from "../../infrastructure/database/data-source";
import { User } from "../../../users/domain/user.entity";

export class SeedDatabaseUseCase {
  async execute(): Promise<void> {
    console.log("Starting database seeding...");

    const userRepository = AppDataSource.getRepository(User);

    await AppDataSource.query(
      'TRUNCATE TABLE "transactions", "users" RESTART IDENTITY CASCADE',
    );

    console.log("Database cleared.");

    const usersData = [
      {
        name: "Joaquin de los Reyes",
        email: "joaquin@example.com",
        balance: 1000000,
      },
      { name: "Roberto Sanchez", email: "roberto@example.com", balance: 50000 },
      {
        name: "Javier Ramirez",
        email: "javier@example.com",
        balance: 0,
      },
      { name: "Juan Perez", email: "juan@example.com", balance: 10000 },
    ];

    await userRepository.save(usersData);

    console.log("Seeding completed successfully!");
  }
}
