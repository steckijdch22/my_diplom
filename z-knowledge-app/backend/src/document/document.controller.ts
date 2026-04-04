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
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController {
  constructor(private readonly docService: DocumentService) {}

  @Post()
  async create(@Body() dto: CreateDocumentDto, @Request() req: any) {
    return this.docService.create(req.user.userId, dto.title, dto.documentKey);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.docService.getDocument(id);
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
