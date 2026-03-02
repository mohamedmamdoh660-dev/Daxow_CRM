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
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import { resolveViewScope } from '../../common/helpers/view-scope.helper';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('students')
export class StudentsController {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly prisma: PrismaService,
    ) { }

    @Post()
    @RequirePermissions({ module: 'Students', action: 'add' })
    @ApiOperation({ summary: 'Create a new student' })
    @ApiResponse({ status: 201, description: 'Student created successfully' })
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    @RequirePermissions({ module: 'Students', action: 'view' }, { module: 'Students', action: 'view_all' })
    @ApiOperation({ summary: 'Get all students' })
    @ApiResponse({ status: 200, description: 'List of all students' })
    async findAll(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('search') search: string,
        @Request() req: any,
    ) {
        const userId = req.user?.id || req.user?.sub;
        const ownerFilter = await resolveViewScope(this.prisma, userId, 'Students');

        return this.studentsService.findAll(
            page ? Number(page) : 1,
            pageSize ? Number(pageSize) : 10,
            search,
            ownerFilter,
        );
    }

    @Get(':id')
    @RequirePermissions({ module: 'Students', action: 'view' }, { module: 'Students', action: 'view_all' })
    @ApiOperation({ summary: 'Get a student by ID' })
    @ApiResponse({ status: 200, description: 'Student found' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Students', action: 'edit' })
    @ApiOperation({ summary: 'Update a student' })
    @ApiResponse({ status: 200, description: 'Student updated successfully' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Students', action: 'delete' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a student' })
    @ApiResponse({ status: 204, description: 'Student deleted successfully' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    remove(@Param('id') id: string) {
        return this.studentsService.remove(id);
    }
}
