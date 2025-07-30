import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHeavyOperation(): string {
    for (let i = 0; i < 10000000000; i++) {}
    return 'Cluster';
  }
  getHello(): string {
    process.send?.('hello');
    return 'Hello World!';
  }
}
