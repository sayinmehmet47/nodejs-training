type ParentMessage = {
  amountToAdd: number;
};

let counter: number = 0;
const inspectionTimeMs: number = 30_000;

process.once("message", ({ amountToAdd }: ParentMessage) => {
  counter += amountToAdd;

  process.send?.(`My counter is now ${counter}.`);

  setTimeout(() => {
    process.disconnect();
  }, inspectionTimeMs);
});
