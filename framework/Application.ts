import http, { IncomingMessage, ServerResponse } from "http";
import { EventEmitter } from "events";

export type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;
export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

interface Route {
  path: string;
  handler: RouteHandler;
  method: HttpMethod;
  middleware: Middleware[];
}

export class Router {
  public routes: Route[] = [];
  private globalMiddleware: Middleware[] = [];

  private addRoute(
    method: HttpMethod,
    path: string,
    handler: RouteHandler,
    middleware: Middleware[] = []
  ) {
    this.routes.push({ path, handler, method, middleware });
  }

  public get(
    path: string,
    handler: RouteHandler,
    middleware: Middleware[] = []
  ) {
    this.addRoute("GET", path, handler, middleware);
    return this;
  }

  public post(
    path: string,
    handler: RouteHandler,
    middleware: Middleware[] = []
  ) {
    this.addRoute("POST", path, handler, middleware);
    return this;
  }

  public delete(
    path: string,
    handler: RouteHandler,
    middleware: Middleware[] = []
  ) {
    this.addRoute("DELETE", path, handler, middleware);
    return this;
  }

  public use(middleware: Middleware) {
    this.globalMiddleware.push(middleware);
    return this;
  }

  public getGlobalMiddleware(): Middleware[] {
    return this.globalMiddleware;
  }
}

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export class Application extends EventEmitter {
  private server: http.Server;
  private router: Router;
  private globalMiddleware: Middleware[] = [];

  constructor() {
    super();
    this.router = new Router();
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private async executeMiddleware(
    middleware: Middleware[],
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<boolean> {
    let currentIndex = 0;

    const next = () => {
      currentIndex++;
      if (currentIndex < middleware.length) {
        middleware[currentIndex](req, res, next);
      }
    };

    if (middleware.length > 0) {
      return new Promise((resolve) => {
        const finalNext = () => {
          resolve(true);
        };

        middleware[0](req, res, () => {
          if (currentIndex >= middleware.length - 1) {
            finalNext();
          } else {
            next();
          }
        });
      });
    }

    return true;
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const { method, url } = req;

    if (!method || !url) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Bad Request");
    }

    const route = this.router.routes.find(
      (r) => r.path === url && r.method === method.toUpperCase()
    );

    if (route) {
      // Combine global middleware, router middleware, and route-specific middleware
      const allMiddleware = [
        ...this.globalMiddleware,
        ...this.router.getGlobalMiddleware(),
        ...route.middleware,
      ];

      // Execute middleware chain
      const middlewareResult = await this.executeMiddleware(
        allMiddleware,
        req,
        res
      );

      if (middlewareResult) {
        return route.handler(req, res);
      }
      return; // Middleware handled the response
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404: Not Found");
  }

  public use(middlewareOrRouter: Middleware | Router) {
    if (typeof middlewareOrRouter === "function") {
      this.globalMiddleware.push(middlewareOrRouter);
    } else {
      this.router.routes.push(...middlewareOrRouter.routes);
    }
    return this;
  }

  public listen(port: number, callback: () => void) {
    this.server.listen(port, callback);
    return this.server;
  }
}
