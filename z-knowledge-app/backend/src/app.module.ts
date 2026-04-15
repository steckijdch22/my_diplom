import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    DocumentModule,
    RedisModule,
  ],
})
export class AppModule {}
