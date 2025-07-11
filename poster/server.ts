import { Application } from "../framework/Application.ts";
import staticRouter from "./routes/static.routes.ts";
import apiRouter from "./routes/api.routes.ts";
import authRouter from "./routes/auth.routes.ts";

// Get port from environment or use default
const PORT = parseInt(process.env.PORT || "3000", 10);
const app = new Application();

// Mount the routers
app.use(staticRouter);
app.use(apiRouter);
app.use(authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Poster App running on http://localhost:${PORT}`);
  console.log(`📊 Process ID: ${process.pid}`);
});
