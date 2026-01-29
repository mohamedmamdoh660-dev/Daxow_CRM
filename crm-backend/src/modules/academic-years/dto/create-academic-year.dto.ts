import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademicYearDto {
    @ApiProperty({ example: '2024-2025', description: 'Academic year name' })
    @IsString()
    name: string;

    @ApiProperty({ example: true, description: 'Is this academic year active?', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: false, description: 'Is this the default academic year?', required: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
