import { injectable } from "inversify";
import { IWarrior, TYPES } from "../types";
import { container } from "../inversify.config";
import { UserService } from "./UserService";

@injectable()
export class Ninja implements IWarrior {
  private skillLevel: number = 1;

  fight() {
    return "Ninja strikes!";
  }

  train(level: number) {
    this.skillLevel = Math.max(1, level);
    return `Ninja trained to level ${this.skillLevel}`;
  }

  getSkillLevel() {
    return this.skillLevel;
  }
}
