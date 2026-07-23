#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main() {
    int sockfd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[1024];

    // 1. Create a UDP socket
    //    AF_INET  = IPv4
    //    SOCK_DGRAM = UDP (datagram)
    //    0 = default protocol
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        exit(1);
    }

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family      = AF_INET;          // IPv4
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY); // listen on all interfaces
    server_addr.sin_port        = htons(9999);       // port 9999

    // 2. Bind socket to port 9999
    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind");
        exit(1);
    }

    printf("UDP server listening on 0.0.0.0:9999\n");

    while (1) {
        // 3. recvfrom — receive a datagram
        //    No connection, no handshake. Just grab whatever arrives.
        ssize_t n = recvfrom(sockfd, buffer, sizeof(buffer) - 1, 0,
                             (struct sockaddr *)&client_addr, &client_len);
        if (n < 0) {
            perror("recvfrom");
            continue;
        }

        buffer[n] = '\0';

        printf("Received %zd bytes from %s:%d | \"%s\"\n",
               n,
               inet_ntoa(client_addr.sin_addr),
               ntohs(client_addr.sin_port),
               buffer);

        // 4. sendto — send a reply back
        sendto(sockfd, buffer, n, 0,
               (struct sockaddr *)&client_addr, client_len);
    }

    close(sockfd);
    return 0;
}
