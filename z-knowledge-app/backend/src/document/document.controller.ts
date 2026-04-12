import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { UserService } from 'src/user/user.service';

@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController {
  constructor(
    private readonly docService: DocumentService,
    private readonly userService: UserService,
  ) {}

  @Post('share/:id')
  async share(
    @Param('id') documentId: string,
    @Body() dto: { targetEmail: string; encryptedKey: string },
    @Request() req: any,
  ) {
    const targetUser = await this.userService.findByEmail(dto.targetEmail);
    if (!targetUser) {
      throw new NotFoundException('Такого пользователя не существует');
    }
    return this.docService.addAccess(
      documentId,
      targetUser.id,
      dto.encryptedKey,
      req.user.userId,
    );
  }
  @Post()
  async create(@Body() dto: CreateDocumentDto, @Request() req: any) {
    return this.docService.create(req.user.userId, dto.title, dto.documentKey);
  }

  @Get('user/access/:id')
  async getAccessUser(@Param('id') id: string, @Request() req: any) {
    return await this.docService.getAccessUser(id, req.user.userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Request() req: any) {
    return this.docService.getDocument(id, req.user.userId);
  }
  @Get()
  async findAll(@Request() req: any) {
    return this.docService.findAll(req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @Request() req: any,
  ) {
    return this.docService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.docService.delete(id, req.user.userId);
  }
}
