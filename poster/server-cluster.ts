import { Application } from "../framework/Application.ts";
import staticRouter from "./routes/static.routes.ts";
import apiRouter from "./routes/api.routes.ts";
import authRouter from "./routes/auth.routes.ts";

// Get port from environment or command line argument
const PORT = parseInt(process.env.PORT || process.argv[2] || "3001", 10);

const app = new Application();

// Mount the routers
app.use(staticRouter);
app.use(apiRouter);
app.use(authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Poster App Instance running on http://localhost:${PORT}`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(`\n🛑 Shutting down instance on port ${PORT}...`);
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log(`\n🛑 Terminating instance on port ${PORT}...`);
  process.exit(0);
});
