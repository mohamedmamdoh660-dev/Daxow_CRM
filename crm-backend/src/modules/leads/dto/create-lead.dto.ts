import { IsString, IsEmail, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateLeadDto {
    @IsEnum(['Student', 'Agent'])
    type: string;

    @IsString()
    @IsOptional()
    fullName?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    source?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    preferredIntake?: string;

    @IsArray()
    @IsOptional()
    preferredCountries?: string[];

    @IsString()
    @IsOptional()
    budgetRange?: string;

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    contactPerson?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsOptional()
    estimatedStudents?: number;

    @IsOptional()
    proposedCommission?: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    assignedTo?: string;

    @IsString()
    @IsOptional()
    ownerId?: string;  // User ID (Direct) or Agent ID (Agent)

    @IsString()
    @IsOptional()
    ownerType?: string;  // 'Direct' | 'Agent'

    @IsOptional()
    @IsArray()
    documents?: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        fileType: string;
    }>;

    @IsOptional()
    metadata?: any;
}
