import express, { Express } from "express";
import fs from "fs";
import path from "path";

const loadRoutes = (app: Express) => {
  const router = express.Router();
  const routesPath = path.join(__dirname);

  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".ts") && file !== "index.ts") {
      const routeName = file.split(".")[0];
      console.log(`Attempting to load route:`, routeName);

      try {
        const routeModule = require(path.join(routesPath, file));
        console.log(`Route loaded successfully:`, routeName);
        router.use(`/${routeName}`, routeModule.default);
      } catch (error) {
        console.error(`Error loading route ${routeName}:`, error);
      }
    }
  });

  app.use(router);
};

export default loadRoutes;
