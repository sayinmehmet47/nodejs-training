import { inject } from "inversify";
import { IWarrior, FACTORIES } from "../types";
import { controller, httpGet, httpPost, requestBody, requestParam } from "inversify-express-utils";
import { interfaces } from "inversify";
import createHttpError from "http-errors";

@controller("/api/warrior")
export class WarriorController {
  constructor(
    @inject(FACTORIES.WarriorFactory)
    private warriorFactory: interfaces.Factory<IWarrior>
  ) {}

  private getWarrior(warriorType: string): IWarrior {
    try {
      return this.warriorFactory(warriorType) as IWarrior;
    } catch (error) {
      throw createHttpError(400, "Invalid warrior type specified.");
    }
  }

  @httpGet("/:warriorType/fight")
  getWarriorFight(@requestParam("warriorType") warriorType: string) {
    const warrior = this.getWarrior(warriorType);
    return warrior.fight();
  }

  @httpPost("/:warriorType/train")
  trainWarrior(
    @requestParam("warriorType") warriorType: string,
    @requestBody() { level }: { level: number }
  ) {
    if (typeof level !== "number") {
      throw createHttpError(400, "Level must be a number");
    }
    const warrior = this.getWarrior(warriorType);
    return warrior.train(level);
  }

  @httpGet("/:warriorType/skill-level")
  getSkillLevel(@requestParam("warriorType") warriorType: string) {
    const warrior = this.getWarrior(warriorType);
    return {
      skillLevel: warrior.getSkillLevel(),
    };
  }
}

