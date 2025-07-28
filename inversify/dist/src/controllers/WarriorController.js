"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarriorController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const express_1 = __importDefault(require("express"));
const inversify_express_utils_1 = require("inversify-express-utils");
let WarriorController = class WarriorController {
    constructor(warriorFactory) {
        this.warriorFactory = warriorFactory;
    }
    getWarriorFight(req, res) {
        try {
            const warrior = this.warriorFactory(req.params.warriorType);
            res.send(warrior.fight());
        }
        catch (error) {
            res.status(400).send("Invalid warrior type specified.");
        }
    }
};
exports.WarriorController = WarriorController;
__decorate([
    (0, inversify_express_utils_1.httpGet)("/:warriorType/fight"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WarriorController.prototype, "getWarriorFight", null);
exports.WarriorController = WarriorController = __decorate([
    (0, inversify_express_utils_1.controller)("/api/warrior"),
    __param(0, (0, inversify_1.inject)(types_1.FACTORIES.WarriorFactory)),
    __metadata("design:paramtypes", [Object])
], WarriorController);
