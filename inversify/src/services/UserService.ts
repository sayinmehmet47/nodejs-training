import { injectable } from "inversify";
import { User } from "../models/user";
import createHttpError from "http-errors";

@injectable()
export class UserService {
  private userStorage: User[] = [
    {
      email: "lorem@ipsum.com",
      name: "Lorem",
    },
    {
      email: "doloe@sit.com",
      name: "Dolor",
    },
  ];

  public getUsers(): User[] {
    return this.userStorage;
  }

  public getUser(id: string): User {
    const user = this.userStorage.find((user) => user.name === id);
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    return user;
  }

  public newUser(user: User): User {
    this.userStorage.push(user);
    return user;
  }

  public updateUser(id: string, user: User): User {
    const index = this.userStorage.findIndex((entry) => entry.name === id);
    if (index === -1) {
      throw createHttpError(404, "User not found");
    }
    this.userStorage[index] = user;
    return user;
  }

  public deleteUser(id: string): string {
    const initialLength = this.userStorage.length;
    this.userStorage = this.userStorage.filter((user) => user.name !== id);
    if (this.userStorage.length === initialLength) {
      throw createHttpError(404, "User not found");
    }
    return id;
  }
}

