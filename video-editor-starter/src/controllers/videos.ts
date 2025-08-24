import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { deleteFileOrDir } from '../../lib/utils';
import { mkdir } from 'node:fs/promises';
import db from '../DB';
import { RequestWithUserId } from '../middleware';
import { makeThumbnail } from '../../lib/ff';

export const getVideos = (req: Request, res: Response, next: NextFunction) => {
  const videos = db.videos.filter(
    (video) => video.userId === (req as RequestWithUserId).userId
  );
  res.json(videos);
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
  const thumbnailPath = path.join(videoDir, `thumbnail.jpg`);

  try {
    // Ensure directory exists
    await mkdir(videoDir, { recursive: true });

    // Save file with pipeline
    const writableStream = fs.createWriteStream(videoPath);
    await pipeline(req, writableStream);

    // make thumbnail
    await makeThumbnail(videoPath, thumbnailPath);

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

// Content type mapping for file extensions
const CONTENT_TYPES = {
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
} as const;

export const getVideoAsset = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { videoId, type } = req.query as { videoId: string; type: string };
  const video = db.videos.find((v) => v.videoId === videoId);

  if (!video) {
    return next({ status: 404, message: 'Video not found' });
  }

  // Determine file details based on type
  const fileDetails = getFileDetails(type, video);

  // Set headers for proper download
  res.setHeader('Content-Type', fileDetails.contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${fileDetails.downloadName}"`
  );

  // Serve the file
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'storage',
      video.videoId,
      fileDetails.filename
    )
  );
};

const getFileDetails = (type: string, video: any) => {
  switch (type) {
    case 'thumbnail':
      return {
        filename: 'thumbnail.jpg',
        contentType: 'image/jpeg',
        downloadName: `${video.name.replace(/\.[^/.]+$/, '')}_thumbnail.jpg`,
      };

    case 'original':
      return {
        filename: `original.${video.extension}`,
        contentType:
          CONTENT_TYPES[
            video.extension.toLowerCase() as keyof typeof CONTENT_TYPES
          ] || 'application/octet-stream',
        downloadName: video.name,
      };

    default:
      return {
        filename: type,
        contentType: 'application/octet-stream',
        downloadName: type,
      };
  }
};
