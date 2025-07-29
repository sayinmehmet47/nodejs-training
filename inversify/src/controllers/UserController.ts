import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  requestParam,
  requestBody,
} from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../types";
import { UserService } from "../services/UserService";
import { User } from "../models/user";

@controller("/user")
export class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}

  @httpGet("/")
  public getUsers(): User[] {
    return this.userService.getUsers();
  }

  @httpGet("/:id")
  public getUser(@requestParam("id") id: string): User {
    return this.userService.getUser(id);
  }

  @httpPost("/")
  public newUser(@requestBody() user: User): User {
    return this.userService.newUser(user);
  }

  @httpPut("/:id")
  public updateUser(
    @requestParam("id") id: string,
    @requestBody() user: User
  ): User {
    return this.userService.updateUser(id, user);
  }

  @httpDelete("/:id")
  public deleteUser(@requestParam("id") id: string): string {
    return this.userService.deleteUser(id);
  }
}
