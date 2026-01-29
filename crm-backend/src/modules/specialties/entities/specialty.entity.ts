import { Specialty } from '@prisma/client';

export class SpecialtyEntity implements Specialty {
    id: string;
    name: string; // Added name property
    titleId: string;
    facultyId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
