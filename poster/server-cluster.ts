import { Application } from "../framework/Application.ts";
import staticRouter from "./routes/static.routes.ts";
import apiRouter from "./routes/api.routes.ts";
import authRouter from "./routes/auth.routes.ts";
import { initializeRedis, closeRedis } from "./utils/redis-session.ts";

const PORT = parseInt(process.env.PORT || process.argv[2] || "3001", 10);

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
      console.log(
        `🚀 Poster App Instance running on http://localhost:${PORT} (PID: ${process.pid})`
      );
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log(
        `\n🛑 Shutting down instance on port ${PORT} (PID: ${process.pid})...`
      );
      await closeRedis();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log(
        `\n🛑 Terminating instance on port ${PORT} (PID: ${process.pid})...`
      );
      await closeRedis();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
