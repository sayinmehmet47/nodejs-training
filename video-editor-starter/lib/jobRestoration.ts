import * as path from 'path';
import * as fs from 'fs';
import db from '../src/DB';

export interface ResizeJobData {
  videoId: string;
  width: number;
  height: number;
}

export interface ExtractAudioJobData {
  videoId: string;
}

export interface UnfinishedJob {
  id: string;
  type: 'resize' | 'extract-audio';
  data: ResizeJobData | ExtractAudioJobData;
  resolve?: () => void;
  reject?: () => void;
}

export const restoreUnfinishedJobs = (): UnfinishedJob[] => {
  const unfinishedJobs: UnfinishedJob[] = [];

  db.videos.forEach((video) => {
    Object.entries(video.resizes).forEach(([resizeKey, resize]) => {
      if (resize.processing) {
        const [width, height] = resizeKey.split('x').map(Number);
        unfinishedJobs.push({
          id: `${video.videoId}-${resizeKey}`,
          type: 'resize' as const,
          data: {
            videoId: video.videoId,
            width,
            height,
          },
        });
      }
    });

    // Check for unfinished audio extraction jobs
    if (!video.extractedAudio) {
      const audioPath = path.join('./storage', video.videoId, 'audio.mp3');
      // Only add job if audio file doesn't exist AND database shows it's not extracted
      if (!fs.existsSync(audioPath)) {
        console.log(
          `Found unfinished audio job for video ${
            video.videoId
          }: extractedAudio=${video.extractedAudio}, fileExists=${fs.existsSync(
            audioPath
          )}`
        );
        unfinishedJobs.push({
          id: `${video.videoId}-audio`,
          type: 'extract-audio' as const,
          data: {
            videoId: video.videoId,
          },
        });
      }
    }
  });

  console.log(
    `Restoring ${unfinishedJobs.length} unfinished jobs:`,
    unfinishedJobs.map((job) => ({ id: job.id, type: job.type }))
  );

  return unfinishedJobs;
};
