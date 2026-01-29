import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    fullName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    passportNumber?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    agentId?: string;

    @IsOptional()
    @IsBoolean()
    transferStudent?: boolean;

    @IsOptional()
    metadata?: any;
}
