"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const types_1 = require("./types");
const NinjaService_1 = require("./services/NinjaService");
const SamuraiService_1 = require("./services/SamuraiService");
const LoggerMiddleware_1 = require("./middleware/LoggerMiddleware");
const container = new inversify_1.Container();
exports.container = container;
// Bind services
container.bind(types_1.TYPES.Warrior).to(NinjaService_1.Ninja).whenTargetNamed("ninja");
container.bind(types_1.TYPES.Warrior).to(SamuraiService_1.Samurai).whenTargetNamed("samurai");
// Bind middleware
container.bind(LoggerMiddleware_1.LoggerMiddleware).toSelf();
// Bind factory
container.bind(types_1.FACTORIES.WarriorFactory).toFactory((context) => {
    return (...args) => {
        const named = args[0];
        if (typeof named !== 'string') {
            throw new Error("Warrior factory expects a string name as the first argument.");
        }
        return context.container.getNamed(types_1.TYPES.Warrior, named);
    };
});
