import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialtyDto {
    @ApiProperty({ example: 'Computer Science', description: 'Specialty Name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'clxxx...', description: 'Faculty ID' })
    @IsString()
    facultyId: string;

    @ApiProperty({ example: true, description: 'Is this specialty active?', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
