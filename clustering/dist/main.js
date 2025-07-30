"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const numCPUs = (0, os_1.cpus)().length;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(process.env.PORT ?? 3000);
}
if (cluster_1.default.isPrimary) {
    console.log(`Primary server ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
    cluster_1.default.on('listening', (worker) => {
        console.log(`worker ${worker.process.pid} is listening`);
    });
    cluster_1.default.on('message', (worker, message) => {
        console.log(`worker ${worker.process.pid} sent message: ${message}`);
    });
    cluster_1.default.on('fork', (worker) => {
        console.log(`worker ${worker.process.pid} forked`);
    });
    cluster_1.default.on('disconnect', (worker) => {
        console.log(`worker ${worker.process.pid} disconnected`);
    });
    cluster_1.default.on('error', (error) => {
        console.log(`worker error: ${error}`);
    });
    cluster_1.default.on('online', (worker) => {
        console.log(`worker ${worker.process.pid} is online`);
    });
}
else {
    bootstrap();
    console.log(`Worker ${process.pid} started`);
}
//# sourceMappingURL=main.js.map