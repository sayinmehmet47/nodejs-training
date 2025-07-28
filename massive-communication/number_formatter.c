// number_formatter.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_INPUT 4096
#define MAX_WORDS 256

int main(int argc, char *argv[]) {
    if (argc < 4) {
        fprintf(stderr, "Usage: %s <output_file> <prefix> <suffix>\n", argv[0]);
        return 1;
    }

    char *output_file = argv[1];
    char *prefix = argv[2];
    char *suffix = argv[3];



    char input[MAX_INPUT];
    if (!fgets(input, sizeof(input), stdin)) {
        fprintf(stderr, "Failed to read input\n");
        return 1;
    }

    // Tokenize input by spaces
    char *words[MAX_WORDS];
    int count = 0;
    char *token = strtok(input, " \n");
    while (token && count < MAX_WORDS) {
        words[count++] = token;
        token = strtok(NULL, " \n");
    }

    // Open output file
    FILE *fp = fopen(output_file, "w");
    if (!fp) {
        perror("fopen");
        return 1;
    }

    // Write formatted output
    for (int i = 0; i < count; ++i) {
        fprintf(fp, "%s%s", prefix, words[i]);
        if (i < count - 1) {
            fprintf(fp, "%s ", suffix);
        }
    }
    fprintf(fp, "\n");
    fclose(fp);

    return 0;
}