import { provide } from "inversify-binding-decorators";
import { TYPES } from "../types";

interface IUser {
  email: string;
  name: string;
  _id?: string;
}

@provide(TYPES.User)
export class User implements IUser {
  constructor(public email: string, public name: string, public _id?: string) {}
}
