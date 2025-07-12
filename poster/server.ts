import { Application } from "../framework/Application.ts";
import staticRouter from "./routes/static.routes.ts";
import apiRouter from "./routes/api.routes.ts";
import authRouter from "./routes/auth.routes.ts";
import { initializeRedis, closeRedis } from "./utils/redis-session.ts";

// Get port from environment or use default
const PORT = parseInt(process.env.PORT || "3000", 10);

const startServer = async () => {
  try {
    // Initialize Redis connection
    await initializeRedis();

    const app = new Application();

    // Mount the routers
    app.use(staticRouter);
    app.use(apiRouter);
    app.use(authRouter);

    app.listen(PORT, () => {
      console.log(`🚀 Poster App running on http://localhost:${PORT}`);
      console.log(`📊 Process ID: ${process.pid}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log(`\n🛑 Shutting down server on port ${PORT}...`);
      await closeRedis();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log(`\n🛑 Terminating server on port ${PORT}...`);
      await closeRedis();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
