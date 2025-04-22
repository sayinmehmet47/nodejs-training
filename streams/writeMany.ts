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

(async () => {
  console.time('writeManyStreams');
  const fileHandle = open('./text.txt', 'w');
  const stream = (await fileHandle).createWriteStream();

  for (let index = 0; index < 1000000; index++) {
    const text = index + ' text ';
    const buff = Buffer.from(text, 'utf-8');
    await stream.write(buff);
  }

  console.timeEnd('writeManyStreams');
})();
