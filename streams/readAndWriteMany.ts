import { open } from 'node:fs/promises';

(async () => {
  const fileHandle = await open('./text.txt', 'r');
  const fileHandle2 = await open('./dest.txt', 'w');
  const readStream = fileHandle.createReadStream();
  const writeStream = fileHandle2.createWriteStream();

  readStream.pipe(writeStream);

  writeStream.on('finish', async () => {
    await fileHandle.close();
    await fileHandle2.close();
    console.log('Copy finished and files closed.');
  });

  readStream.on('error', (err) => {
    console.error('Read error:', err);
  });

  writeStream.on('error', (err) => {
    console.error('Write error:', err);
  });
})();
