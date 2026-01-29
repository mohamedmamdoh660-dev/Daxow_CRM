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
import { User } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@ApiTags('Academic Years')
@Controller('academic-years')
export class AcademicYearsController {
    constructor(private readonly academicYearsService: AcademicYearsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new academic year' })
    @ApiResponse({ status: 201, description: 'Academic year created successfully' })
    create(
        @Body() createAcademicYearDto: CreateAcademicYearDto,
        @User() user: string
    ) {
        return this.academicYearsService.create(createAcademicYearDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all academic years' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of academic years' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.academicYearsService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get academic year by ID' })
    @ApiResponse({ status: 200, description: 'Academic year found' })
    @ApiResponse({ status: 404, description: 'Academic year not found' })
    findOne(@Param('id') id: string) {
        return this.academicYearsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update academic year' })
    @ApiResponse({ status: 200, description: 'Academic year updated successfully' })
    @ApiResponse({ status: 404, description: 'Academic year not found' })
    update(
        @Param('id') id: string,
        @Body() updateAcademicYearDto: UpdateAcademicYearDto,
        @User() user: string
    ) {
        return this.academicYearsService.update(id, updateAcademicYearDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete academic year' })
    @ApiResponse({ status: 200, description: 'Academic year deleted successfully' })
    @ApiResponse({ status: 404, description: 'Academic year not found' })
    remove(
        @Param('id') id: string,
        @User() user: string
    ) {
        return this.academicYearsService.remove(id, user);
    }
}
