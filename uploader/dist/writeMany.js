import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
const FILE_PATH = path.resolve("largefile_5GB.txt");
const TARGET_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
const CHUNK_SIZE = 1024 * 1024; // 1 MB per write
const CHUNK_DATA = "A".repeat(CHUNK_SIZE); // 1MB of 'A'
const stream = fs.createWriteStream(FILE_PATH);
// Create a progress bar
const progressBar = new cliProgress.SingleBar({
    format: "⏳ Writing |{bar}| {percentage}% | {value}/{total} GB",
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
});
let written = 0;
progressBar.start(5, 0); // Show progress in GB
function writeChunk() {
    let ok = true;
    while (written < TARGET_SIZE_BYTES && ok) {
        written += CHUNK_SIZE;
        // Update progress bar (convert to GB)
        progressBar.update(written / (1024 * 1024 * 1024));
        // If false, wait for drain
        ok = stream.write(CHUNK_DATA);
    }
    if (written >= TARGET_SIZE_BYTES) {
        stream.end(() => {
            progressBar.stop();
            console.log("✅ Done writing 5GB file.");
        });
    }
    else {
        stream.once("drain", writeChunk);
    }
}
writeChunk();
