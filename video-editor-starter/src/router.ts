import { Express } from 'express';
import * as User from './controllers/user';
import * as Video from './controllers/videos';

import { authenticate } from './middleware/index';

export default (server: Express) => {
  // ------------------------------------------------ //
  // ************ USER ROUTES ************* //
  // ------------------------------------------------ //

  // Log a user in and give them a token
  server.post('/api/login', User.logUserIn);

  // Log a user out
  server.delete('/api/logout', authenticate, User.logUserOut);

  // Send user info
  server.get('/api/user', authenticate, User.sendUserInfo);

  // Update a user info
  server.put('/api/user', authenticate, User.updateUser);

  // ------------------------------------------------ //
  // ************ VIDEO ROUTES ************* //
  // ------------------------------------------------ //

  // Get all videos
  server.get('/api/videos', authenticate, Video.getVideos);

  // Upload a video
  server.post('/api/upload-video', authenticate, Video.uploadVideo);

  // Get a video asset
  server.get('/get-video-asset', authenticate, Video.getVideoAsset);

  // Extract audio from a video
  server.patch('/api/video/extract-audio', authenticate, Video.extractAudio);

  // Resize a video
  server.put('/api/video/resize', authenticate, Video.resizeVideo);
};
