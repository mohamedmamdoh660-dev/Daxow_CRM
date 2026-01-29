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
import { DegreesService } from './degrees.service';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpdateDegreeDto } from './dto/update-degree.dto';

@ApiTags('Degrees')
@Controller('degrees')
export class DegreesController {
    constructor(private readonly degreesService: DegreesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new degree' })
    @ApiResponse({ status: 201, description: 'Degree created successfully' })
    create(@Body() createDegreeDto: CreateDegreeDto) {
        return this.degreesService.create(createDegreeDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all degrees' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of degrees' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.degreesService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get degree by ID' })
    @ApiResponse({ status: 200, description: 'Degree found' })
    @ApiResponse({ status: 404, description: 'Degree not found' })
    findOne(@Param('id') id: string) {
        return this.degreesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update degree' })
    @ApiResponse({ status: 200, description: 'Degree updated successfully' })
    @ApiResponse({ status: 404, description: 'Degree not found' })
    update(@Param('id') id: string, @Body() updateDegreeDto: UpdateDegreeDto) {
        return this.degreesService.update(id, updateDegreeDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete degree' })
    @ApiResponse({ status: 200, description: 'Degree deleted successfully' })
    @ApiResponse({ status: 404, description: 'Degree not found' })
    remove(@Param('id') id: string) {
        return this.degreesService.remove(id);
    }
}
