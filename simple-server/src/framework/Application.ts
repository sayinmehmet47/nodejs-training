import http, { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

export type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;

interface Route {
  path: string;
  handler: RouteHandler;
  method: HttpMethod;
}

export class Router {
  public routes: Route[] = [];

  private addRoute(method: HttpMethod, path: string, handler: RouteHandler) {
    this.routes.push({ path, handler, method });
  }

  public get(path: string, handler: RouteHandler) {
    this.addRoute('GET', path, handler);
    return this;
  }

  public post(path: string, handler: RouteHandler) {
    this.addRoute('POST', path, handler);
    return this;
  }
}

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD';

export class Application extends EventEmitter {
  private server: http.Server;
  private router: Router;

  constructor() {
    super();
    this.router = new Router();
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    const { method, url } = req;

    if (!method || !url) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad Request');
    }

    const route = this.router.routes.find(
      (r) => r.path === url && r.method === method.toUpperCase()
    );

    if (route) {
      return route.handler(req, res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404: Not Found');
  }

  public use(router: Router) {
    this.router.routes.push(...router.routes);
  }

  public listen(port: number, callback: () => void) {
    this.server.listen(port, callback);
    return this.server;
  }
}
