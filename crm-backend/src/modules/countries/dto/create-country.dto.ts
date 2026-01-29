import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateCountryDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsString()
    @IsOptional()
    phoneCode?: string;

    @IsString()
    region: string;

    @IsBoolean()
    @IsOptional()
    activeOnNationalities?: boolean;


    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
