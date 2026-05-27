This project uses Docker. Both the database (PostgreSQL) and API (Node.js) are containerized. To run the project locally, follow these steps:

How to Run the Proyect Locally

1. Prerequisites
   - Ensure you have Docker installed on your machine. You can download it from [Docker's official website](https://www.docker.com/get-started).

2. Clone the Repository
   - Clone this repository to your local machine.

3. Navigate to the Project Directory and run the following command:

   ```bash
   docker-compose up --build
   ```

Once the build process is complete, the API will be up and running in http://localhost:3000, and you can see the documentation (Swagger UI) at http://localhost:3000/documentation.

You can stop the containers by running:

    ```bash
    docker-compose down
    ```
