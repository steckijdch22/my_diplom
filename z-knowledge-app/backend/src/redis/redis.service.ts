import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);
  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.getOrThrow('REDIS_HOST'),
      port: this.configService.getOrThrow('REDIS_PORT'),
      lazyConnect: true,
    });
  }

  async onModuleInit() {
    try {
      await this.redisClient.connect();
      this.logger.log('Успешное подключение к Redis');
    } catch (error) {
      this.logger.error(
        '❌ Не удалось подключиться к Redis при старте:',
        error,
      );
      process.exit(1);
    }
  }

  async set(key: string, value: Uint8Array, ttlSeconds = 3600) {
    await this.redisClient.set(key, Buffer.from(value), 'EX', ttlSeconds);
  }

  async get(key: string): Promise<Uint8Array | null> {
    const buffer = await this.redisClient.getBuffer(key);
    return buffer ? new Uint8Array(buffer) : null;
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
