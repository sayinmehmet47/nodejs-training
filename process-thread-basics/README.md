# Processes and Threads: A Beginner's Guide

This lesson assumes you are completely new to processes and threads. The
examples use only features built into Node.js, so there is nothing to install.

## What You Will Learn

After completing the examples, you should understand:

1. What a program, process, and thread are
2. How to recognize separate processes
3. How to recognize threads in the same Node.js process
4. How memory differs between processes and threads
5. When to use a child process or a worker thread

## The Basic Idea

A **program** is code stored on disk. This file is a program:

```text
01-one-process.ts
```

When you ask Node.js to run that program, the operating system creates a
**process**. A process is a running instance of a program. It owns resources
such as memory and open files.

Every process has at least one **thread**. A thread is the path of instructions
that the CPU executes inside the process.

```text
Node.js process
└── Main thread
    ├── Execute line 1
    ├── Execute line 2
    └── Execute line 3
```

A process can also contain multiple threads:

```text
Node.js process
├── Main thread
├── Worker thread 1
└── Worker thread 2
```

### A Simple Analogy

Think of a process as a kitchen and threads as cooks working in that kitchen.

- Separate kitchens have separate ingredients and tools.
- Cooks in one kitchen can use shared ingredients and tools.
- Adding cooks can allow work to happen in parallel.
- Cooks sharing tools must coordinate to avoid interfering with each other.

The analogy is not exact, but it is a useful first mental model.

## Process vs Thread

| Question | Process | Thread |
| --- | --- | --- |
| What is it? | A running program | A path of execution inside a process |
| Identity in Node.js | `process.pid` | `threadId` |
| Memory | Separate from other processes | Can explicitly share memory with threads in its process |
| Communication | Messages through IPC, sockets, files, etc. | Messages or shared memory |
| Creation cost | Higher | Lower |
| Isolation | Stronger | Weaker |
| Failure effect | Usually limited to one process | May affect the entire process |

`PID` means **process identifier**. The operating system gives every running
process a PID.

## Before Running the Examples

Open a terminal in the repository root and check Node.js:

```bash
node --version
```

This project currently uses Node.js `v23.7.0`. Direct `.ts` execution is
enabled by default in Node.js 22 from `v22.18.0`, in Node.js 23 from `v23.6.0`,
and in current newer releases.

Node.js removes erasable TypeScript syntax, such as type annotations, and then
executes the file. It does **not** type-check your code. These lessons avoid
TypeScript features that require code transformation, so no TypeScript runner
or compilation command is needed.

Node.js `v23.7.0` may print an `ExperimentalWarning` about type stripping. That
warning is expected on this Node.js release and does not mean the example
failed.

Run every command below from the repository root. Your numeric IDs will be
different from the example output, and some output lines may appear in a
different order. That is normal.

## Lesson 1: One Process and One Main Thread

Run:

```bash
node process-thread-basics/01-one-process.ts
```

Example output:

```text
1. The process started.
   Process ID: 12345
   Thread ID: 0 (the main thread)
2. Node.js will wait for 30 seconds. Inspect it now.
3. The timer finished. The process can now exit.
```

Important observations:

- `process.pid` identifies the Node.js process.
- The main Node.js thread has thread ID `0`.
- The 30-second timer gives you time to find the process in Activity Monitor.
- Node.js keeps the process alive while the timer is still waiting.
- The process exits when there is no more work to perform.

Try running the command twice. You should receive a new process ID each time,
because each execution creates a new process.

## Lesson 2: A Parent Process and a Child Process

Run:

```bash
node process-thread-basics/02-parent-process.ts
```

The parent uses `fork()` to start another Node.js process. In this API, `fork`
means "start a child Node.js process with a communication channel." It is not
the same operation as the POSIX `fork()` system call.

Example output:

```text
Parent process ID: 20000
Child process ID: 20001
Child says: My counter is now 5.
Parent counter is still 0.
Both processes will stay open for 30 seconds. Inspect them now.
Child process finished.
```

Important observations:

- The parent and child have different process IDs.
- Each process has its own `counter` variable and memory.
- Changing the child's counter does not change the parent's counter.
- The two processes communicate by sending a message through IPC.
- Both processes stay open for 30 seconds so you can inspect them.

While they are open, replace the example IDs below with the two IDs printed in
your terminal:

```bash
ps -p 20000,20001 -o pid,ppid,state,%cpu,%mem,etime,command
```

The child process's `PPID` (parent process ID) should equal the parent's `PID`:

```text
  PID  PPID  COMMAND
20000  ...   node process-thread-basics/02-parent-process.ts
20001 20000  node process-thread-basics/02-child-process.ts
```

You can also search for `node` in Activity Monitor and match the two printed
PIDs. After 30 seconds, both processes will exit and disappear.

`IPC` means **inter-process communication**. Processes cannot normally read
each other's JavaScript variables directly, so they need a communication
method.

Files used by this lesson:

```text
02-parent-process.ts  -> starts the child and receives its message
02-child-process.ts   -> changes its own counter and sends a message
```

## Lesson 3: A Main Thread and a Worker Thread

Run:

```bash
node process-thread-basics/03-main-thread.ts
```

Example output:

```text
Main:   process ID = 30000, thread ID = 0
Worker: process ID = 30000, thread ID = 1
Worker calculated 7 * 6 = 42.
Worker thread finished.
```

Important observations:

- The main thread and worker have the same process ID.
- They have different thread IDs.
- Both threads belong to one process.
- The main thread passes input using `workerData`.
- The worker returns its result using `postMessage()`.

Files used by this lesson:

```text
03-main-thread.ts    -> creates and listens to the worker
03-worker-thread.ts  -> performs work on another thread
```

This gives us a useful test:

```text
Different PID                       = different process
Same PID but different thread ID    = different thread in one process
```

## Lesson 4: Sharing Memory Between Threads

Run:

```bash
node process-thread-basics/04-shared-memory.ts
```

Example output:

```text
Main: value before worker = 10
Worker: changed the shared value from 10 to 15
Main: value after worker = 15
```

JavaScript objects passed in normal worker messages are copied using the
structured clone algorithm. Changing a copied object does not change the
original object.

To truly share memory, this example creates a `SharedArrayBuffer`. The main
thread and worker thread can both access the same bytes. The worker uses
`Atomics.add()` so that changing the number is one safe, indivisible operation.

Shared memory is powerful, but it adds risks such as race conditions. Start
with worker messages. Learn shared memory only when you have a real need for
it.

Files used by this lesson:

```text
04-shared-memory.ts  -> creates and reads the shared memory
04-shared-worker.ts  -> changes the shared memory
```

## What Is a Race Condition?

Imagine that two threads share this number:

```text
counter = 0
```

Both threads read `0`, both add `1`, and both write `1`. You expected `2`, but
the final value is `1`. The result depended on the timing of the threads. This
is a **race condition**.

Synchronization tools such as atomic operations, locks, and mutexes coordinate
access to shared data. These are important topics, but first become comfortable
with the four examples in this lesson.

## Concurrency and Parallelism

These words are related but different:

- **Concurrency:** Multiple tasks make progress during the same period.
- **Parallelism:** Multiple tasks execute at the exact same time on different
  CPU cores.

One cook switching between two meals is concurrent. Two cooks preparing two
meals at the same time are parallel.

Worker threads can perform CPU work in parallel when multiple CPU cores are
available. Asynchronous Node.js operations can be concurrent without your
JavaScript code creating a worker thread.

## Which Tool Should I Use in Node.js?

Use normal asynchronous Node.js code for operations such as:

- Reading files
- Calling an API
- Querying a database
- Waiting for a timer

Consider a worker thread for CPU-heavy JavaScript such as:

- Calculating prime numbers
- Processing large images
- Compressing or transforming large amounts of data
- Performing expensive mathematical calculations

Consider a child process when you need:

- Stronger isolation
- To run another program or command
- Separate process memory
- Multiple independent application instances

Do not create a worker thread for every small task. Starting workers also has a
cost. Real applications commonly reuse a limited pool of workers.

## Check Your Understanding

Try answering these questions before reading the answers:

1. Can a process exist without any thread?
2. If two running tasks have different PIDs, are they threads in one process?
3. If two running tasks have the same PID but different thread IDs, what are
   they?
4. Does changing a variable in a child process change the parent's variable?
5. What problem can happen when threads update shared memory without
   coordination?

### Answers

1. No. A process has at least one thread.
2. No. They are separate processes.
3. They are different threads inside the same process.
4. No. Child processes have separate memory.
5. A race condition can occur.

## Practice Exercises

1. Run Lesson 1 three times and write down each PID.
2. Change the number sent to the child in `02-parent-process.ts` from `5` to
   `20`. Predict the output, then run it.
3. Change Lesson 3 to calculate `9 * 9`.
4. Change the starting shared value in Lesson 4 from `10` to `100`.
5. Change `Atomics.add(sharedNumbers, 0, 5)` to add `25`, then predict both
   printed values.

## Final Mental Model

Keep this picture in your mind:

```text
Operating system
├── Process A (its own memory, PID 100)
│   ├── Main thread (thread ID 0)
│   └── Worker thread (thread ID 1)
└── Process B (its own memory, PID 101)
    └── Main thread (thread ID 0)
```

The process is the resource and isolation boundary. Threads are the execution
paths that perform work inside that process.
