import { Router } from "../../../framework/Application.js";
import { loginUser } from "../controllers/auth.controller.js";
import { getUsers } from "../controllers/user.controller.js";
import { uploadFile } from "../controllers/upload.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const apiRouter = new Router();

apiRouter.post("/api/login", loginUser);

// The following routes are protected by the auth middleware
apiRouter.get("/api/users", (req, res) => {
  authMiddleware(req, res, () => getUsers(req, res));
});

apiRouter.post("/api/upload", (req, res) => {
  authMiddleware(req, res, () => uploadFile(req, res));
});

export default apiRouter;
