import http from "node:http";

const agent = new http.Agent({ keepAlive: true });

const request = http.request(
  {
    agent: agent,
    hostname: "localhost",
    port: 8050,
    method: "POST",
    path: "/create-post",
    headers: {
      "content-type": "application/json",
    },
  },
  (response) => {
    let responseBody = "";

    response.on("data", (chunk) => {
      responseBody += chunk;
    });

    response.on("end", () => {
      try {
        const parsedResponse = JSON.parse(responseBody);

        console.log("Response Body (Parsed):", parsedResponse);
      } catch (error) {
        console.log("Response Body (Raw):", responseBody);
        console.error("Error parsing JSON:", error);
      }
    });
  }
);

request.end(
  JSON.stringify({ message: "This is going to be my last message!" })
);
