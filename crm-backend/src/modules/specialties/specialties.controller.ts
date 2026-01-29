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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
    constructor(private readonly specialtiesService: SpecialtiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new specialty' })
    @ApiResponse({ status: 201, description: 'Specialty created successfully' })
    create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
        return this.specialtiesService.create(createSpecialtyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all specialties' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'facultyId', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of specialties' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('facultyId') facultyId?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.specialtiesService.findAll({
            skip,
            take: pageSize,
            search,
            facultyId,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specialty by ID' })
    @ApiResponse({ status: 200, description: 'Specialty found' })
    @ApiResponse({ status: 404, description: 'Specialty not found' })
    findOne(@Param('id') id: string) {
        return this.specialtiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update specialty' })
    @ApiResponse({ status: 200, description: 'Specialty updated successfully' })
    @ApiResponse({ status: 404, description: 'Specialty not found' })
    update(@Param('id') id: string, @Body() updateSpecialtyDto: UpdateSpecialtyDto) {
        return this.specialtiesService.update(id, updateSpecialtyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete specialty' })
    @ApiResponse({ status: 200, description: 'Specialty deleted successfully' })
    @ApiResponse({ status: 404, description: 'Specialty not found' })
    remove(@Param('id') id: string) {
        return this.specialtiesService.remove(id);
    }
}
