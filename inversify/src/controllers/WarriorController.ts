import { inject } from "inversify";
import { IWarrior, FACTORIES } from "../types";
import express from "express";
import { controller, httpGet, httpPost } from "inversify-express-utils";
import { interfaces } from "inversify";

@controller("/api/warrior")
export class WarriorController {
  constructor(
    @inject(FACTORIES.WarriorFactory)
    private warriorFactory: interfaces.Factory<IWarrior>
  ) {}

  @httpGet("/:warriorType/fight")
  getWarriorFight(req: express.Request, res: express.Response) {
    try {
      const warrior = this.warriorFactory(req.params.warriorType) as IWarrior;
      res.send(warrior.fight());
    } catch (error) {
      res.status(400).send("Invalid warrior type specified.");
    }
  }

  @httpPost("/:warriorType/train")
  trainWarrior(req: express.Request, res: express.Response) {
    try {
      const warrior = this.warriorFactory(req.params.warriorType) as IWarrior;
      const { level } = req.body;

      if (typeof level !== "number") {
        return res.status(400).send("Level must be a number");
      }

      const result = warrior.train(level);
      res.send(result);
    } catch (error) {
      res.status(400).send("Invalid warrior type specified.");
    }
  }

  @httpGet("/:warriorType/skill-level")
  getSkillLevel(req: express.Request, res: express.Response) {
    try {
      const warrior = this.warriorFactory(req.params.warriorType) as IWarrior;
      res.status(200).send({
        skillLevel: warrior.getSkillLevel(),
      });
    } catch (error) {
      res.status(400).send("Invalid warrior type specified.");
    }
  }
}
