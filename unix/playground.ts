import { exec } from "child_process";

exec("ls -l", (error, stdout, stderr) => {
  console.log(stdout);
  if (error) {
    console.error(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
});
