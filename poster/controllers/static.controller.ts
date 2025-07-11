import { ServerResponse } from "http";
import { createReadStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicFolder = path.join(__dirname, "../public");

export const serveStaticFile = (
  res: ServerResponse,
  fileName: string,
  contentType: string
) => {
  const filePath = path.join(publicFolder, fileName);
  const readStream = createReadStream(filePath);

  readStream.on("error", (err) => {
    console.error(`Error reading static file: ${fileName}`, err);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404: File Not Found");
  });

  res.writeHead(200, { "Content-Type": contentType });
  readStream.pipe(res);
};
