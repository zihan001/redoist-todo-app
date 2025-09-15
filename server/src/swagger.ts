import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { pathToFileURL } from "url";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Redoist API",
      version: "1.0.0",
    },
  },
  apis: [path.join(process.cwd(), "src/routes/**/*.ts")],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(swaggerSpec, null, 2));
}
