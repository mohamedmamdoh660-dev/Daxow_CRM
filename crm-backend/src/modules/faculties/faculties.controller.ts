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
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@ApiTags('Faculties')
@Controller('faculties')
export class FacultiesController {
    constructor(private readonly facultiesService: FacultiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new faculty' })
    @ApiResponse({ status: 201, description: 'Faculty created successfully' })
    create(@Body() createFacultyDto: CreateFacultyDto) {
        return this.facultiesService.create(createFacultyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all faculties' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of faculties' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.facultiesService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get faculty by ID' })
    @ApiResponse({ status: 200, description: 'Faculty found' })
    @ApiResponse({ status: 404, description: 'Faculty not found' })
    findOne(@Param('id') id: string) {
        return this.facultiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update faculty' })
    @ApiResponse({ status: 200, description: 'Faculty updated successfully' })
    @ApiResponse({ status: 404, description: 'Faculty not found' })
    update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
        return this.facultiesService.update(id, updateFacultyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete faculty' })
    @ApiResponse({ status: 200, description: 'Faculty deleted successfully' })
    @ApiResponse({ status: 404, description: 'Faculty not found' })
    remove(@Param('id') id: string) {
        return this.facultiesService.remove(id);
    }
}
