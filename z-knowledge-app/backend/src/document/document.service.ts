import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DocumentMapper } from './document.mapper';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string, documentKey: string) {
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          title,
          ownerId: userId,
        },
      });

      await tx.documentAccess.create({
        data: {
          documentId: document.id,
          userId: userId,
          encryptedKey: documentKey,
        },
      });
      return document;
    });
  }

  async findAll(userId: string) {
    const records = await this.prisma.documentAccess.findMany({
      where: { userId },
      include: {
        document: {
          include: {
            owner: {
              select: { email: true },
            },
          },
        },
      },
    });
    return records.map((record) =>
      DocumentMapper.toResponseDto(record, userId),
    );
  }

  async getAccessUser(documentId: string, userId: string) {
    const documents = await this.prisma.documentAccess.findMany({
      where: { documentId: documentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return documents.map((doc) =>
      DocumentMapper.userWithDocumentAccess(doc, userId),
    );
  }

  async addAccess(
    documentId: string,
    targetUserId: string,
    encryptedKey: string,
    requestUserId: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });

    if (!document) {
      throw new NotFoundException('Документ не найден');
    }

    if (document.ownerId !== requestUserId) {
      throw new ForbiddenException(
        'Только владелец документа может предоставлять доступ',
      );
    }

    return this.prisma.documentAccess.upsert({
      where: {
        documentId_userId: {
          documentId: documentId,
          userId: targetUserId,
        },
      },
      update: {
        encryptedKey: encryptedKey,
      },
      create: {
        documentId: documentId,
        userId: targetUserId,
        encryptedKey: encryptedKey,
      },
    });
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

  async getDocument(docId: string, userId: string) {
    const record = await this.prisma.documentAccess.findUnique({
      where: {
        documentId_userId: { documentId: docId, userId },
      },
      include: {
        document: {
          include: {
            owner: { select: { email: true } },
          },
        },
      },
    });

    if (!record)
      throw new NotFoundException('Документ не найден или нет доступа');

    return DocumentMapper.toResponseDto(record, userId);
  }

  async getRawDocument(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.document.deleteMany({ where: { id, ownerId: userId } });
  }
}
