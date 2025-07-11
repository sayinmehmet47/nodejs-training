import { Router } from "../../framework/Application.ts";
import { IncomingMessage, ServerResponse } from "http";
import { sessions, users } from "../utils/session.ts";

const authRouter = new Router();

// Helper function to get request body
const getRequestBody = async (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
};

// Login endpoint
authRouter.post("/api/login", async (req, res) => {
  try {
    const body = await getRequestBody(req);
    const { username, password } = body;

    if (!username || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Username and password are required" })
      );
    }

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }

    // Generate session token (in real app, use JWT)
    const sessionToken = Math.random().toString(36).substring(2);
    sessions.set(sessionToken, user.id);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": `session=${sessionToken}; HttpOnly; Path=/; Max-Age=3600`,
    });
    res.end(
      JSON.stringify({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

// Logout endpoint
authRouter.delete("/api/logout", (req, res) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const sessionMatch = cookies.match(/session=([^;]+)/);
    if (sessionMatch) {
      sessions.delete(sessionMatch[1]);
    }
  }

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Set-Cookie": "session=; HttpOnly; Path=/; Max-Age=0",
  });
  res.end(JSON.stringify({ message: "Logout successful" }));
});

export default authRouter;
