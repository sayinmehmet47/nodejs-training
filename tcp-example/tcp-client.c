#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <ip> <message>\n", argv[0]);
        exit(1);
    }

    int sockfd;
    struct sockaddr_in server_addr;
    char buffer[1024];

    // 1. Create TCP socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) { perror("socket"); exit(1); }

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port   = htons(9998);
    inet_pton(AF_INET, argv[1], &server_addr.sin_addr);

    // 2. Connect — TCP handshake happens here (SYN, SYN-ACK, ACK)
    if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("connect"); exit(1);
    }
    printf("Connected to %s:9998\n", argv[1]);

    // 3. Write — send data over the established connection
    ssize_t sent = write(sockfd, argv[2], strlen(argv[2]));
    printf("Sent %zd bytes: \"%s\"\n", sent, argv[2]);

    // 4. Read — wait for reply
    ssize_t n = read(sockfd, buffer, sizeof(buffer) - 1);
    if (n > 0) {
        buffer[n] = '\0';
        printf("Reply: \"%s\"\n", buffer);
    }

    // 5. Close — triggers FIN handshake
    close(sockfd);
    printf("Connection closed.\n");
    return 0;
}
