#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main() {
    int server_fd, client_fd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[1024];

    // 1. Create a TCP socket
    //    SOCK_STREAM = TCP (stream)
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) { perror("socket"); exit(1); }

    // Allow reusing the port after restart
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family      = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    server_addr.sin_port        = htons(9998);

    // 2. Bind
    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind"); exit(1);
    }

    // 3. Listen — TCP-only. Tells kernel to accept connections.
    if (listen(server_fd, 5) < 0) {
        perror("listen"); exit(1);
    }

    printf("TCP server listening on 0.0.0.0:9998\n");

    while (1) {
        // 4. Accept — blocks until a client connects.
        //    Returns a NEW socket dedicated to this client.
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        if (client_fd < 0) { perror("accept"); continue; }

        printf("Client connected from %s:%d\n",
               inet_ntoa(client_addr.sin_addr),
               ntohs(client_addr.sin_port));

        // 5. Read/Write — connection-oriented. No addresses needed.
        //    Just read from the socket like a file.
        while (1) {
            ssize_t n = read(client_fd, buffer, sizeof(buffer) - 1);
            if (n <= 0) {
                if (n == 0) printf("Client disconnected (FIN received)\n");
                else        perror("read");
                break;
            }
            buffer[n] = '\0';
            printf("Received: \"%s\"\n", buffer);

            // Echo it back
            write(client_fd, buffer, n);
        }

        close(client_fd);
    }

    close(server_fd);
    return 0;
}
