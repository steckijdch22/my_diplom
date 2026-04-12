import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  documentKey: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  encryptedContent?: Buffer;
}

export interface DocumentResponseDto {
  id: string;
  title: string;
  role: 'owner' | 'guest';
  wrappedKey: string;
  updatedAt: Date;
  ownerEmail: string;
}

export interface UserWithDocumentAccessResponseDto {
  id: string;
  email: string;
  role: 'owner' | 'guest';
}
