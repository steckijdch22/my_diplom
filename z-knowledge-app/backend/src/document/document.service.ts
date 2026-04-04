import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string) {
    return this.prisma.document.create({
      data: { title, ownerId: userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({ where: { ownerId: userId } });
  }

  async update(id: string, userId: string, data: any) {
    const doc = await this.prisma.document.findFirst({
      where: { id, ownerId: userId },
    });
    if (!doc) throw new NotFoundException('Документ не найден');

    return this.prisma.document.update({ where: { id }, data });
  }

  async updateContent(id: string, content: Uint8Array) {
    return this.prisma.document.update({
      where: { id },
      data: {
        encryptedContent: Buffer.from(content),
      },
    });
  }

  async getDocument(id: string) {
    return this.prisma.document.findUnique({ where: { id } });
  }

  async delete(id: string, userId: string) {
    return this.prisma.document.deleteMany({ where: { id, ownerId: userId } });
  }
}
