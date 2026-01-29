import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSemesterDto {
    @ApiProperty({ example: 'Fall 2024', description: 'Semester name' })
    @IsString()
    name: string;

    @ApiProperty({ example: true, description: 'Is this semester active?', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: false, description: 'Is this the default semester?', required: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
