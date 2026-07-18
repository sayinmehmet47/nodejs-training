// short polling example
import express, { type Request, type Response } from "express";

const PORT = 8080;
const app = express();

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

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get("/checkstatus", async (req: Request, res: Response) => {
  const { jobId } = req.query as { jobId?: string };
  if (!jobId) return res.status(400).json({ error: "missing jobId" });

  // wait until the promise resolved
  await new Promise<void>((resolve) => {
    const check = () => {
      const job = jobs.get(jobId!);
      if (!job || job.progress >= 100) {
        resolve();
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });

  res.json(jobs.get(jobId!));
});

function updateJob(jobId: string, progress: number): void {
  const status: JobStatus = { progress, completed: progress >= 100 };
  jobs.set(jobId, status);

  console.log(`Updated ${jobId} to ${progress}%`);

  if (progress >= 100) return;

  setTimeout(() => updateJob(jobId, progress + 10), 3000);
}
