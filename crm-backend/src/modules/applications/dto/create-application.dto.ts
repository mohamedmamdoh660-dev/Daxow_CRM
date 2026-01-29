import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
    @IsString()
    studentId: string;

    @IsString()
    programId: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsEnum(['Low', 'Medium', 'High'])
    @IsOptional()
    priority?: string;

    @IsDateString()
    @IsOptional()
    applicationDate?: string;

    @IsString()
    @IsOptional()
    expectedIntake?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    estimatedValue?: number;

    @IsString()
    @IsOptional()
    assignedTo?: string;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsOptional()
    stageHistory?: any;

    @IsOptional()
    metadata?: any;

    @IsString()
    @IsOptional()
    notes?: string;
}
