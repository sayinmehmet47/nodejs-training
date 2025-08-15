import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { deleteFileOrDir } from '../../lib/utils';
import { mkdir } from 'node:fs/promises';
import db from '../DB';
import { RequestWithUserId } from '../middleware';

export const getVideos = (req: Request, res: Response, next: NextFunction) => {
  const name = req.query.name as string;
  if (name) {
    res.json({ message: `Your name is ${name}` });
  } else {
    return next({ status: 400, message: 'Name is required' });
  }
};

export const uploadVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const videoName = req.headers.filename as string;
  if (!videoName) {
    return next({ status: 400, message: 'Missing filename in headers' });
  }

  const extension = path.extname(videoName).substring(1).toLowerCase();
  const videoId = randomBytes(4).toString('hex');
  const videoDir = path.join('./storage', videoId);
  const videoPath = path.join(videoDir, `original.${extension}`);

  try {
    // Ensure directory exists
    await mkdir(videoDir, { recursive: true });

    // Save file with pipeline
    const writableStream = fs.createWriteStream(videoPath);
    await pipeline(req, writableStream);

    // Add video to database
    const newVideo = {
      id: db.videos.length + 1,
      name: videoName,
      extension: extension,
      dimensions: {
        width: 1920,
        height: 1080,
      },
      videoId,
      userId: (req as RequestWithUserId).userId,
      extractedAudio: false,
      resizes: {},
    };

    db.videos.push(newVideo);
    db.save(); // Save changes to files

    res.status(200).json({
      status: 'success',
      message: 'Video uploaded successfully',
      id: videoId,
      path: videoPath,
    });
  } catch (error) {
    // Cleanup on failure
    await deleteFileOrDir(videoPath);
    await deleteFileOrDir(videoDir);
    // log the error
    console.error(error);
    res.status(500).json({ message: 'Failed to upload video' });
  }
};
