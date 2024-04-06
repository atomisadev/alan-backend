"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const loadRoutes = (app) => {
    const router = express_1.default.Router();
    const routesPath = path_1.default.join(__dirname);
    fs_1.default.readdirSync(routesPath).forEach((file) => {
        if (file.endsWith(".ts") && file !== "index.ts") {
            const routeName = file.split(".")[0];
            console.log(`Attempting to load route:`, routeName);
            try {
                const routeModule = require(path_1.default.join(routesPath, file));
                console.log(`Route loaded successfully:`, routeName);
                router.use(`/${routeName}`, routeModule.default);
            }
            catch (error) {
                console.error(`Error loading route ${routeName}:`, error);
            }
        }
    });
    app.use(router);
};
exports.default = loadRoutes;
