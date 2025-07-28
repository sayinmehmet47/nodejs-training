import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";

import { Request, Response, NextFunction } from "express";

@injectable()
export class LoggerMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  }
}
