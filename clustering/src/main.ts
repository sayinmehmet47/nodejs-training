import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cluster from 'cluster';
import { cpus } from 'os';

const numCPUs = cpus().length;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

if (cluster.isPrimary) {
  console.log(`Primary server ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  cluster.on('listening', (worker) => {
    console.log(`worker ${worker.process.pid} is listening`);
  });

  cluster.on('message', (worker, message) => {
    console.log(`worker ${worker.process.pid} sent message: ${message}`);
  });
  cluster.on('fork', (worker) => {
    console.log(`worker ${worker.process.pid} forked`);
  });
  cluster.on('disconnect', (worker) => {
    console.log(`worker ${worker.process.pid} disconnected`);
  });
  cluster.on('error', (error) => {
    console.log(`worker error: ${error}`);
  });
  cluster.on('online', (worker) => {
    console.log(`worker ${worker.process.pid} is online`);
  });
} else {
  bootstrap();
  console.log(`Worker ${process.pid} started`);
}
