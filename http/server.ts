import http from "node:http";

const server = http.createServer();

server.on("request", (request, response) => {
  console.log("-----METHOD:-----");
  console.log(request.method);
  console.log("-----URL:-----");
  console.log(request.url); // Fixed: Use request.url instead of request.method
  console.log("-----HEADERS:-----");
  console.log(request.headers); // Fixed: Use request.headers instead of request.method
  console.log("-----BODY:-----");

  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString("utf-8");
    console.log(chunk.toString("utf-8"));
  });

  request.on("end", () => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        status: "success",
        received: JSON.parse(body),
        message: "Message received successfully",
      })
    );
  });
});

server.listen(8050, "localhost", () => {
  console.log(`Listening on ${8050}`);
});
