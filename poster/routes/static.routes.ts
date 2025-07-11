import { Router } from "../../framework/Application.ts";
import { serveStaticFile } from "../controllers/static.controller.ts";

const staticRouter = new Router();

staticRouter.get("/", (req, res) => {
  serveStaticFile(res, "index.html", "text/html");
});

staticRouter.get("/index.html", (req, res) => {
  serveStaticFile(res, "index.html", "text/html");
});

staticRouter.get("/styles.css", (req, res) => {
  serveStaticFile(res, "styles.css", "text/css");
});

staticRouter.get("/scripts.js", (req, res) => {
  serveStaticFile(res, "scripts.js", "application/javascript");
});

export default staticRouter;
