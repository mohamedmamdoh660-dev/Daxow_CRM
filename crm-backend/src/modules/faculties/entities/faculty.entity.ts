import { Faculty } from '@prisma/client';

export class FacultyEntity implements Faculty {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
