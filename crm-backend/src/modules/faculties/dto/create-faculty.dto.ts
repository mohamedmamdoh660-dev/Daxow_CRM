import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacultyDto {
    @ApiProperty({ example: 'Engineering', description: 'Faculty name' })
    @IsString()
    name: string;

    @ApiProperty({ example: true, description: 'Is this faculty active?', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
