import { City } from '@prisma/client';

export class CityEntity implements City {
    id: string;
    name: string;
    countryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
