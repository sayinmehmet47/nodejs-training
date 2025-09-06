import { spawn } from 'node:child_process';

export const makeThumbnail = async (
  videoPath: string,
  thumbnailPath: string
) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('ffmpeg', [
      '-i',
      videoPath,
      '-ss',
      '00:00:01',
      '-vframes',
      '1',
      thumbnailPath,
    ]);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg failed with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

export const getVideoDimensions = async (
  videoPath: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const child = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      videoPath,
    ]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        const videoStream = result.streams?.find(
          (stream: { width: number; height: number }) =>
            stream.width && stream.height
        );

        if (!videoStream) {
          reject(new Error('No video stream found with dimensions'));
          return;
        }

        resolve({
          width: videoStream.width,
          height: videoStream.height,
        });
      } catch (parseError) {
        reject(new Error(`Failed to parse ffprobe output: ${parseError}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

export const checkHasAudio = async (videoPath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const child = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type',
      '-of',
      'csv=p=0',
      videoPath,
    ]);

    let stdout = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed with code ${code}`));
        return;
      }

      const hasAudio = stdout.includes('audio');
      resolve(hasAudio);
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

export const extractAudioFromVideo = async (
  videoPath: string,
  audioPath: string
) => {
  const hasAudio = await checkHasAudio(videoPath);
  if (!hasAudio) {
    throw new Error('Video file contains no audio stream');
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn('ffmpeg', [
      '-y',
      '-i',
      videoPath,
      '-q:a',
      '0',
      '-map',
      '0:a',
      audioPath,
    ]);

    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
      } else {
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

export const resizeVideoFile = async (
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-vf',
      `scale=${width}:${height}`,
      '-c:a',
      'copy',
      outputPath,
    ]);

    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
      } else {
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};
