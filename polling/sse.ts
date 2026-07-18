import { readFileSync } from "node:fs";
import { join } from "node:path";
import express, { type Request, type Response } from "express";

const PORT = 8080;
const app = express();

const html = readFileSync(join(import.meta.dirname, "sse.html"), "utf-8");

type JobStatus = {
  progress: number;
  completed: boolean;
};

const jobs = new Map<string, JobStatus>();

app.post("/submit", (req: Request, res: Response) => {
  const jobId = `job:${Date.now()}`;
  jobs.set(jobId, { progress: 0, completed: false });
  updateJob(jobId, 0);
  res.json({ jobId });
});

app.get("/events", (req: Request, res: Response) => {
  const { jobId } = req.query as { jobId?: string };

  if (!jobId) {
    res.status(400).json({ error: "missing jobId" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.write("event: connected\ndata: Subscribed to job\n\n");

  const interval = setInterval(() => {
    const job = jobs.get(jobId);
    if (!job) {
      res.write("event: error\ndata: Job not found\n\n");
      res.end();
      clearInterval(interval);
      return;
    }

    res.write(`data: ${JSON.stringify(job)}\n\n`);

    if (job.completed) {
      res.write("event: done\ndata: Job finished\n\n");
      res.end();
      clearInterval(interval);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    console.log(`Client disconnected from ${jobId}`);
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.type("html").send(html);
});

app.listen(PORT, () => console.log(`SSE server on http://localhost:${PORT}`));

function updateJob(jobId: string, progress: number): void {
  const status: JobStatus = { progress, completed: progress >= 100 };
  jobs.set(jobId, status);

  console.log(`${jobId} → ${progress}%`);

  if (progress >= 100) return;

  setTimeout(() => updateJob(jobId, progress + 10), 3000);
}
