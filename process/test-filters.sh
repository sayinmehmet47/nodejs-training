#!/bin/bash

echo "=== Testing Filter Programs ==="
echo

echo "1. Original sample.txt:"
cat sample.txt
echo

echo "2. Uppercase filter (std.ts):"
cat sample.txt | npx tsx std.ts
echo

echo "3. Line numbers filter:"
cat sample.txt | npx tsx line-numbers.ts
echo

echo "4. Uppercase filter (uppercase-filter.ts):"
cat sample.txt | npx tsx uppercase-filter.ts
echo

echo "5. Word count filter:"
cat sample.txt | npx tsx word-count.ts
echo

echo "=== Testing with echo ==="
echo "hello world" | npx tsx std.ts
echo

echo "Word count test:"
echo "hello world test" | npx tsx word-count.ts
echo 