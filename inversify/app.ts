import "reflect-metadata";
import express from "express";
import { InversifyExpressServer } from "inversify-express-utils";
import { container } from "./src/inversify.config";
import "./src/ioc/loader";
import { LoggerMiddleware } from "./src/middleware/LoggerMiddleware";

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());
  app.use(container.get(LoggerMiddleware).handler);
});

const app = server.build();

app.listen(3000, () => console.log("Server running on port 3000"));
