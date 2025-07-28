import { injectable } from "inversify";
import { IWarrior } from "../types";

@injectable()
export class Samurai implements IWarrior {
  private skillLevel: number = 2;

  fight() {
    return "Samurai attacks with honor!";
  }

  train(level: number) {
    this.skillLevel = Math.max(1, level);
    return `Samurai trained to level ${this.skillLevel}`;
  }

  getSkillLevel() {
    return this.skillLevel;
  }
}
