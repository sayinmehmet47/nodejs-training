import { open } from 'node:fs/promises';

// (async () => {
//   console.time('writeMany');
//   const fileHandle = await open('./text.txt', 'w');
//   for (let index = 0; index < 1000000; index++) {
//     await fileHandle.write(` ${index}  `);
//   }
//   console.timeEnd('writeMany');
// })();

// Version 2: Use streams

// (async () => {
//   console.time('writeManyStreams');
//   const fileHandle = open('./text.txt', 'w');
//   const stream = (await fileHandle).createWriteStream();

//   for (let index = 0; index < 1000000; index++) {
//     const text = index + ' text ';
//     const buff = Buffer.from(text, 'utf-8');
//     await stream.write(buff);
//   }

//   console.timeEnd('writeManyStreams');
// })();

// ... existing code ...
(async () => {
  console.time('writeManyStreams');

  const fileHandle = await open('./text.txt', 'w');
  const stream = fileHandle.createWriteStream();
  console.log('high mark value', stream.writableHighWaterMark);

  let drainCount = 0;

  for (let index = 0; index < 10000000; index++) {
    const text = index + ' text ';
    const buff = Buffer.from(text, 'utf-8');
    const canContinue = stream.write(buff);
    if (!canContinue) {
      drainCount++;
      await new Promise<void>((resolve) =>
        stream.once('drain', () => resolve())
      );
    }
  }

  console.log('drain event count:', drainCount);

  await new Promise((resolve) => stream.end(resolve));
  await fileHandle.close();

  console.timeEnd('writeManyStreams');
})();
