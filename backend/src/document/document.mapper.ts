import { DocumentAccess, Document, User } from 'generated/prisma/client';
import {
  DocumentResponseDto,
  UserWithDocumentAccessResponseDto,
} from './dto/document.dto';

type AccessWithDocument = DocumentAccess & {
  document: Document & {
    owner: { email: string };
  };
};

type DocumentAccessWithUser = DocumentAccess & {
  user: { id: string; email: string };
};

export class DocumentMapper {
  static toResponseDto(
    accessRecord: AccessWithDocument,
    currentUserId: string,
  ): DocumentResponseDto {
    return {
      id: accessRecord.document.id,
      title: accessRecord.document.title,
      role: accessRecord.document.ownerId === currentUserId ? 'owner' : 'guest',
      wrappedKey: accessRecord.encryptedKey,
      updatedAt: accessRecord.document.updatedAt,
      ownerEmail: accessRecord.document.owner.email,
    };
  }

  static userWithDocumentAccess(
    document: DocumentAccessWithUser,
    userId: string,
  ): UserWithDocumentAccessResponseDto {
    return {
      id: document.user.id,
      email: document.user.email,
      role: document.user.id === userId ? 'owner' : 'guest',
    };
  }
}
