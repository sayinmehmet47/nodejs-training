import { Container, interfaces } from "inversify";
import { IWarrior, TYPES, FACTORIES } from "./types";
import { Ninja } from "./services/NinjaService";
import { Samurai } from "./services/SamuraiService";
import { LoggerMiddleware } from "./middleware/LoggerMiddleware";
import { UserService } from "./services/UserService";

const container = new Container();

container.bind<IWarrior>(TYPES.Warrior).to(Ninja).whenTargetNamed("ninja");
container.bind<IWarrior>(TYPES.Warrior).to(Samurai).whenTargetNamed("samurai");
container.bind<UserService>(TYPES.UserService).to(UserService);

// Bind middleware
container.bind<LoggerMiddleware>(LoggerMiddleware).toSelf();

// Bind factory
container
  .bind<interfaces.Factory<IWarrior>>(FACTORIES.WarriorFactory)
  .toFactory<IWarrior>((context: interfaces.Context) => {
    return (...args: any[]) => {
      const named = args[0];
      if (typeof named !== "string") {
        throw new Error(
          "Warrior factory expects a string name as the first argument."
        );
      }
      return context.container.getNamed<IWarrior>(TYPES.Warrior, named);
    };
  });

export { container };
