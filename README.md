This project uses Docker. Both the database (PostgreSQL) and API (Node.js) are containerized. To run the project locally, follow these steps:

How to Run the Proyect Locally

1. Prerequisites
   - Ensure you have Docker installed on your machine. You can download it from [Docker's official website](https://www.docker.com/get-started).

2. Clone the Repository
   - Clone this repository to your local machine.

3. Generate a .env file copying the .env.example.

4. Navigate to the Project Directory and run the following command:

   ```bash
   docker-compose up --build
   ```

Important: Running the command mentioned will initiate a seeding process to populate the user database, allowing you to begin testing immediately.

Once the build process is complete, the API will be up and running in http://localhost:3000, and you can see the documentation (Swagger UI) at http://localhost:3000/documentation.

You can stop the containers by running:

    ```bash
    docker-compose down
    ```

---

A continuacion, voy a explicar algunas de las decisiones tecnicas tomadas en el desarrollo:

1.  Utilice fastify como framework de desarrollo para la api, debido a su facilidad de iniciacion y su rendimiento. En estos casos donde la velocidad de desarrollo es importante, me parecio una buena opcion, ademas de que estoy familiarizado con su uso. Ademas, su sistema de schemas me permite validar rapidamente las entradas, sin perder mucho tiempo en eso.
2.  Como ORM utilice TypeORM, ya que es de los ORM mas populares en el ecosistema de Node.js con una gran compatibilidad con PostreSQL, ademas de que estoy familiarizado con su uso de transactions, lo que me permitio abordar rapidamente la concurrencia.
3.  Utilice arquitectura hexagonal en todo el proyecto, tratando de respetar su estructura lo mas posible, ya que me parece la mejor forma de hacer un codigo mantenible y escalable. Ademas el patron de inyeccion de dependencias facilita muchisimo los test unitarios, permitiendo testear funcionalidades aisladas.
4.  Decidir correr todo con docker compose build, ya que es la forma mas agnostica de correr el proyecto, intentando reducir lo máximo posible los problemas para que puedan levantarlo, ademas de que me permite correr un proceso de seeding para poblar la base de datos con usuarios, facilitandoles el trabjo de testeo.

Tambien se tomo algunas consideraciones por cuestiones de tiempo, como no implementar un sistema de numeros enteros para menejar correctamente los errores de puntos flotantes, o los mensajes genericos de error (arrojo 500 siempre que tengo un error inesperado).
