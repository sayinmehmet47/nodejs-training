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

    // 1. Create a UDP socket
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        exit(1);
    }

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port   = htons(9999);
    inet_pton(AF_INET, argv[1], &server_addr.sin_addr);

    // 2. sendto — fire and forget
    //    No connect(), no handshake. Just send the datagram.
    ssize_t sent = sendto(sockfd, argv[2], strlen(argv[2]), 0,
                          (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (sent < 0) {
        perror("sendto");
        exit(1);
    }
    printf("Sent %zd bytes to %s:9999 | \"%s\"\n", sent, argv[1], argv[2]);

    // 3. recvfrom — wait for reply (optional, just to see it)
    ssize_t n = recvfrom(sockfd, buffer, sizeof(buffer) - 1, 0, NULL, NULL);
    if (n >= 0) {
        buffer[n] = '\0';
        printf("Reply: \"%s\"\n", buffer);
    }

    close(sockfd);
    return 0;
}
