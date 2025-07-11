import { Router } from "../../framework/Application.ts";
import { sessions, users, getUserFromSession } from "../utils/session.ts";

const apiRouter = new Router();

apiRouter.get("/api/user", (req, res) => {
  const user = getUserFromSession(req.headers.cookie);

  if (!user) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not authenticated" }));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: "active",
    })
  );
});

// Mock posts database
let posts = [
  {
    id: 1,
    title: "First Post",
    body: "This is the content of the first post",
    author: "John Doe",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Second Post",
    body: "This is the content of the second post",
    author: "Jane Smith",
    createdAt: "2024-01-16T14:20:00Z",
  },
  {
    id: 3,
    title: "Third Post",
    body: "This is the content of the third post",
    author: "John Doe",
    createdAt: "2024-01-17T09:15:00Z",
  },
];

// Helper function to get request body
const getRequestBody = async (req: any): Promise<any> => {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: any) => {
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

apiRouter.get("/api/posts", (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(posts));
});

apiRouter.post("/api/posts", async (req, res) => {
  try {
    const body = await getRequestBody(req);
    const { title, content, body: bodyContent } = body;

    // Accept both 'content' and 'body' fields
    const postContent = content || bodyContent;

    if (!title || !postContent) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Title and content/body are required" })
      );
    }

    const newPost = {
      id: posts.length + 1,
      title,
      body: postContent,
      author: "John Doe", // In real app, get from session
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newPost));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

export default apiRouter;
