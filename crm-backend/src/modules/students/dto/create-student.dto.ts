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
    @IsBoolean()
    haveTc?: boolean;

    @IsOptional()
    @IsString()
    tcNumber?: string;

    @IsOptional()
    @IsBoolean()
    blueCard?: boolean;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsDateString()
    passportIssueDate?: string;

    @IsOptional()
    @IsDateString()
    passportExpiryDate?: string;

    @IsOptional()
    @IsString()
    mobile?: string;

    @IsOptional()
    @IsString()
    addressLine1?: string;

    @IsOptional()
    @IsString()
    cityDistrict?: string;

    @IsOptional()
    @IsString()
    stateProvince?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsString()
    addressCountry?: string;

    @IsOptional()
    @IsString()
    fatherName?: string;

    @IsOptional()
    @IsString()
    fatherMobile?: string;

    @IsOptional()
    @IsString()
    fatherOccupation?: string;

    @IsOptional()
    @IsString()
    motherName?: string;

    @IsOptional()
    @IsString()
    motherMobile?: string;

    @IsOptional()
    @IsString()
    motherOccupation?: string;

    @IsOptional()
    @IsString()
    educationLevelId?: string;

    @IsOptional()
    @IsString()
    educationLevelName?: string;

    @IsOptional()
    @IsString()
    highSchoolCountry?: string;

    @IsOptional()
    @IsString()
    highSchoolName?: string;

    @IsOptional()
    @IsString()
    highSchoolGpa?: string;

    @IsOptional()
    @IsString()
    bachelorCountry?: string;

    @IsOptional()
    @IsString()
    bachelorSchoolName?: string;

    @IsOptional()
    @IsString()
    bachelorGpa?: string;

    @IsOptional()
    @IsString()
    masterCountry?: string;

    @IsOptional()
    @IsString()
    masterSchoolName?: string;

    @IsOptional()
    @IsString()
    masterGpa?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    documents?: any[];

    @IsOptional()
    metadata?: any;
}
