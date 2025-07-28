import { injectable } from "inversify";
import { IWarrior } from "../types";

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
