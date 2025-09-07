import * as path from 'path';
import { resizeVideoFile, extractAudioFromVideo } from './ff';
import db from '../src/DB';
import { restoreUnfinishedJobs, UnfinishedJob } from './jobRestoration';

interface ResizeJobData {
  videoId: string;
  width: number;
  height: number;
}

interface ExtractAudioJobData {
  videoId: string;
}

interface Job {
  id: string;
  type: 'resize' | 'extract-audio';
  data: ResizeJobData | ExtractAudioJobData;
  resolve: (value: void) => void;
  reject: (error: unknown) => void;
}

export class JobQueue {
  private jobs: Job[] = [];
  private maxConcurrentJobs: number;
  private currentJobs = 0;
  constructor(
    maxConcurrentJobs: number = 2,
    existingJobs: (Job | UnfinishedJob)[] = []
  ) {
    this.maxConcurrentJobs = maxConcurrentJobs;
    this.jobs = existingJobs.map(job => ({
      ...job,
      resolve: job.resolve || (() => {}),
      reject: job.reject || (() => {})
    })) as Job[];
    this.currentJobs = 0; // No jobs are currently running when starting

    // Process jobs if there are any in the queue
    if (this.jobs.length > 0) {
      console.log(`JobQueue initialized with ${this.jobs.length} pending jobs`);
      this.processNextJob();
    }
  }

  async addJob(
    id: string,
    type: 'resize' | 'extract-audio',
    data: ResizeJobData | ExtractAudioJobData
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const job: Job = { id, type, data, resolve, reject };
      this.jobs.push(job);
      this.processNextJob();
    });
  }

  private async processNextJob() {
    if (this.currentJobs >= this.maxConcurrentJobs || this.jobs.length === 0) {
      return;
    }

    const job = this.jobs.shift();
    if (!job) return;

    this.currentJobs++;

    try {
      if (job.type === 'resize') {
        await this.executeResizeJob(job.data as ResizeJobData);
      } else if (job.type === 'extract-audio') {
        await this.executeExtractAudioJob(job.data as ExtractAudioJobData);
      }
      job.resolve();
    } catch (error) {
      job.reject(error);
    } finally {
      console.log(`Finished processing job ${job.id}`);
      this.currentJobs--;
      this.processNextJob();
    }
  }

  private async executeResizeJob(data: ResizeJobData) {
    const video = db.videos.find((v) => v.videoId === data.videoId);
    if (!video) throw new Error('Video not found');

    const resizeKey = `${data.width}x${data.height}`;
    const videoDir = path.join('./storage', data.videoId);
    const inputPath = path.join(videoDir, `original.${video.extension}`);
    const outputPath = path.join(videoDir, `${resizeKey}.${video.extension}`);

    // process the job log
    console.log(
      `Processing resize job for video ${data.videoId} with dimensions ${data.width}x${data.height}`
    );

    await resizeVideoFile(inputPath, outputPath, data.width, data.height);

    video.resizes[resizeKey].processing = false;
    db.save();
  }

  private async executeExtractAudioJob(data: ExtractAudioJobData) {
    const video = db.videos.find((v) => v.videoId === data.videoId);
    if (!video) throw new Error('Video not found');

    const videoDir = path.join('./storage', data.videoId);
    const videoPath = path.join(videoDir, `original.${video.extension}`);
    const audioPath = path.join(videoDir, 'audio.mp3');

    console.log(
      `Before extraction: video.extractedAudio = ${video.extractedAudio}`
    );

    try {
      await extractAudioFromVideo(videoPath, audioPath);
      video.extractedAudio = true;
      db.save();
      console.log(
        `After extraction and save: video.extractedAudio = ${video.extractedAudio}`
      );
    } catch (error) {
      console.error(
        `Audio extraction failed for video ${data.videoId}:`,
        error
      );

      // If the video has no audio stream, mark as processed to avoid retrying
      if (
        error instanceof Error &&
        error.message.includes('contains no audio stream')
      ) {
        console.log(
          `Video ${data.videoId} has no audio stream, marking as processed`
        );
        video.extractedAudio = true;
        db.save();
      } else {
        throw error;
      }
    }
  }

  getQueueStatus() {
    return {
      pendingJobs: this.jobs.length,
      currentJobs: this.currentJobs,
      maxConcurrentJobs: this.maxConcurrentJobs,
    };
  }
}

const unfinishedJobs = restoreUnfinishedJobs();
export const videoProcessingQueue = new JobQueue(1, unfinishedJobs);
