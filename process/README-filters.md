# Node.js Filter Programs

These are examples of Unix-style filter programs written in Node.js. They read from stdin, process the data, and write to stdout.

## What is a Filter Program?

A filter program is a command-line tool that:

1. Reads all input from stdin (standard input)
2. Processes/transforms the data
3. Writes the result to stdout (standard output)

This allows you to pipe data between programs: `input | filter | output`

## Examples

### 1. Uppercase Filter (`std.ts` or `uppercase-filter.ts`)

Converts all text to uppercase.

```bash
# From a file
cat sample.txt | node std.ts

# From keyboard input (type and press Ctrl+D when done)
node std.ts
```

### 2. Line Numbers Filter (`line-numbers.ts`)

Adds line numbers to each line.

```bash
cat sample.txt | node line-numbers.ts
```

### 3. Word Count Filter

Counts the number of words in the input.

```bash
cat sample.txt | node word-count.ts
```

## How to Use

### Method 1: Pipe from a file

```bash
cat input.txt | node filter.ts > output.txt
```

### Method 2: Pipe between programs

```bash
echo "hello world" | node uppercase-filter.ts
# Output: HELLO WORLD
```

### Method 3: Interactive input

```bash
node filter.ts
# Type your text here
# Press Ctrl+D (Mac/Linux) or Ctrl+Z (Windows) when done
```

## Key Points

1. **`text(process.stdin)`** - Reads ALL input at once, waits for end-of-file
2. **`process.stdout.write()`** - Writes to stdout (no automatic newline)
3. **Error handling** - Always handle errors and exit with proper codes
4. **Async/await** - Required for reading stdin

## Why This Pattern?

This pattern is useful for:

- Text processing pipelines
- Data transformation tools
- Unix-style command-line utilities
- Integration with shell scripts
- Processing large files efficiently
