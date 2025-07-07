import { performance } from "perf_hooks";

const ITERATIONS = 1_000_000;
const SIZE = 564; // 64 bytes, small enough to use the internal pool

console.log(
  `Running ${ITERATIONS} iterations with buffer size ${SIZE} bytes...\n`
);

const allocBenchmark = () => {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    Buffer.alloc(SIZE);
  }
  const end = performance.now();
  console.log(`Buffer.alloc:       ${(end - start).toFixed(2)} ms`);
};

const allocUnsafeBenchmark = () => {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    Buffer.allocUnsafe(SIZE);
  }
  const end = performance.now();
  console.log(`Buffer.allocUnsafe: ${(end - start).toFixed(2)} ms`);
};

allocBenchmark();
allocUnsafeBenchmark();
