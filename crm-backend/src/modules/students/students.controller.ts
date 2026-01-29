import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new student' })
    @ApiResponse({ status: 201, description: 'Student created successfully' })
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all students' })
    @ApiResponse({ status: 200, description: 'List of all students' })
    findAll(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('search') search: string,
    ) {
        return this.studentsService.findAll(
            page ? Number(page) : 1,
            pageSize ? Number(pageSize) : 10,
            search,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a student by ID' })
    @ApiResponse({ status: 200, description: 'Student found' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a student' })
    @ApiResponse({ status: 200, description: 'Student updated successfully' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a student' })
    @ApiResponse({ status: 204, description: 'Student deleted successfully' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    remove(@Param('id') id: string) {
        return this.studentsService.remove(id);
    }
}
