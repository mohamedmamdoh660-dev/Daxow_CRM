import { AcademicYear } from '@prisma/client';

export class AcademicYearEntity implements AcademicYear {
    id: string;
    name: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
