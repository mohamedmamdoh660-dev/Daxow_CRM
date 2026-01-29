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
import { SemestersService } from './semesters.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@ApiTags('Semesters')
@Controller('semesters')
export class SemestersController {
    constructor(private readonly semestersService: SemestersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new semester' })
    @ApiResponse({ status: 201, description: 'Semester created successfully' })
    create(
        @Body() createSemesterDto: CreateSemesterDto,
        @User() user: string
    ) {
        return this.semestersService.create(createSemesterDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all semesters' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of semesters' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.semestersService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get semester by ID' })
    @ApiResponse({ status: 200, description: 'Semester found' })
    @ApiResponse({ status: 404, description: 'Semester not found' })
    findOne(@Param('id') id: string) {
        return this.semestersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update semester' })
    @ApiResponse({ status: 200, description: 'Semester updated successfully' })
    @ApiResponse({ status: 404, description: 'Semester not found' })
    update(
        @Param('id') id: string,
        @Body() updateSemesterDto: UpdateSemesterDto,
        @User() user: string
    ) {
        return this.semestersService.update(id, updateSemesterDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete semester' })
    @ApiResponse({ status: 200, description: 'Semester deleted successfully' })
    @ApiResponse({ status: 404, description: 'Semester not found' })
    remove(
        @Param('id') id: string,
        @User() user: string
    ) {
        return this.semestersService.remove(id, user);
    }
}
