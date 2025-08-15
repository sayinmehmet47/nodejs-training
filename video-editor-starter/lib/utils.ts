import * as fs from 'fs';

export const deleteFileOrDir = (targetPath: string) => {
  fs.stat(targetPath, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    if (stats.isDirectory()) {
      fs.rm(targetPath, { recursive: true, force: true }, (err) => {
        if (err) console.error(err);
      });
    } else {
      fs.unlink(targetPath, (err) => {
        if (err) console.error(err);
      });
    }
  });
};
