import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new country' })
    @ApiResponse({ status: 201, description: 'Country created successfully' })
    @ApiResponse({ status: 409, description: 'Country already exists' })
    create(@Body() createCountryDto: CreateCountryDto) {
        return this.countriesService.create(createCountryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all countries' })
    @ApiResponse({ status: 200, description: 'List of all active countries' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
        @Query('activeOnNationalities') activeOnNationalities?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.countriesService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            activeOnNationalities: activeOnNationalities === 'true' ? true : activeOnNationalities === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a country by ID' })
    @ApiResponse({ status: 200, description: 'Country found' })
    @ApiResponse({ status: 404, description: 'Country not found' })
    findOne(@Param('id') id: string) {
        return this.countriesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a country' })
    @ApiResponse({ status: 200, description: 'Country updated successfully' })
    @ApiResponse({ status: 404, description: 'Country not found' })
    @ApiResponse({ status: 409, description: 'Country name/code already exists' })
    update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
        return this.countriesService.update(id, updateCountryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a country (soft delete)' })
    @ApiResponse({ status: 204, description: 'Country deleted successfully' })
    @ApiResponse({ status: 404, description: 'Country not found' })
    remove(@Param('id') id: string) {
        return this.countriesService.remove(id);
    }
}
