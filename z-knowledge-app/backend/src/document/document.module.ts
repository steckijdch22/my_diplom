import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentGateway } from './document.gateway';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [UserModule, RedisModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
})
export class DocumentModule {}
