import { injectable } from "inversify";
import { User } from "../models/user";

export interface IUser {
  email: string;
  name: string;
}

@injectable()
export class UserService {
  private userStorage: IUser[] = [
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
    return this.userStorage.find((user) => user.name === id) as User;
  }

  public newUser(user: User): User {
    this.userStorage.push(user);
    return user;
  }

  public updateUser(id: string, user: User): User {
    this.userStorage.forEach((entry, index) => {
      if (entry.name === id) {
        this.userStorage[index] = user;
      }
    });

    return user;
  }

  public deleteUser(id: string): string {
    this.userStorage = this.userStorage.filter((user) => user.name !== id);
    return id;
  }
}
