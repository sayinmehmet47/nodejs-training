"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ninja = void 0;
const inversify_1 = require("inversify");
let Ninja = class Ninja {
    constructor() {
        this.skillLevel = 1;
    }
    fight() {
        return "Ninja strikes!";
    }
    train(level) {
        this.skillLevel = Math.max(1, level);
        return `Ninja trained to level ${this.skillLevel}`;
    }
    getSkillLevel() {
        return this.skillLevel;
    }
};
exports.Ninja = Ninja;
exports.Ninja = Ninja = __decorate([
    (0, inversify_1.injectable)()
], Ninja);
