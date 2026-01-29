import { IsBoolean, IsDecimal, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    facultyId: string;

    @IsNotEmpty()
    @IsString()
    specialtyId: string;

    @IsNotEmpty()
    @IsString()
    degreeId: string;

    @IsNotEmpty()
    @IsString()
    languageId: string;

    @IsOptional()
    @IsString()
    countryId?: string;

    @IsOptional()
    @IsString()
    cityId?: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    studyYears?: string;

    @IsOptional()
    @IsString() // Prisma accepts string for Decimal
    officialTuition?: string;

    @IsOptional()
    @IsString() // Prisma accepts string for Decimal
    discountedTuition?: string;

    @IsOptional()
    @IsString()
    tuitionCurrency?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    activeApplications?: boolean;
}
