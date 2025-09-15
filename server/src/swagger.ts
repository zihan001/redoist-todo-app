import { type Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "redoist Todo App API",
      version: "1.0.0",
      description: "API documentation for the redoist Todo App",
    },
    servers: [
      {
        url: "http://localhost:8080/api",
        description: "Local server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export default swaggerOptions;