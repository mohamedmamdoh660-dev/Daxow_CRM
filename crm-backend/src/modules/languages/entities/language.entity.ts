import { Language } from '@prisma/client';

export class LanguageEntity implements Language {
    id: string;
    name: string;
    code: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
