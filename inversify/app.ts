import "reflect-metadata";
import express from "express";
import { InversifyExpressServer } from "inversify-express-utils";
import { container } from "./src/inversify.config";
import "./src/controllers/WarriorController";

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());
});

const app = server.build();

app.listen(3000, () => console.log("Server running on port 3000"));
