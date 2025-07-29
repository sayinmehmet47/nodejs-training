import { interfaces } from "inversify";

export interface IWarrior {
  fight(): string;
  train(level: number): string;
  getSkillLevel(): number;
}

export const TYPES = {
  Warrior: Symbol.for("IWarrior"),
  UserService: Symbol.for("UserService"),
} as const;

export const FACTORIES = {
  WarriorFactory: Symbol.for("WarriorFactory"),
};
