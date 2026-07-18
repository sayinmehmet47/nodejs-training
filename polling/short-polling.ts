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

app.get("/checkstatus", (req: Request, res: Response) => {
  const { jobId } = req.query as { jobId?: string };

  if (!jobId || !jobs.has(jobId)) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const job = jobs.get(jobId)!;
  console.log(`${jobId}: ${job.progress}%`);
  // immediately return the progress
  res.json(job);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

function updateJob(jobId: string, progress: number): void {
  const status: JobStatus = { progress, completed: progress >= 100 };
  jobs.set(jobId, status);

  console.log(`Updated ${jobId} to ${progress}%`);

  if (progress >= 100) return;

  setTimeout(() => updateJob(jobId, progress + 10), 3000);
}
