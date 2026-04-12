import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentGateway } from './document.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
})
export class DocumentModule {}
