import { Semester } from '@prisma/client';

export class SemesterEntity implements Semester {
    id: string;
    name: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
