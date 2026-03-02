import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import { resolveViewScope } from '../../common/helpers/view-scope.helper';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('applications')
export class ApplicationsController {
    constructor(
        private readonly applicationsService: ApplicationsService,
        private readonly prisma: PrismaService,
    ) { }

    @Post()
    @RequirePermissions({ module: 'Applications', action: 'add' })
    @ApiOperation({ summary: 'Create a new application' })
    @ApiResponse({ status: 201, description: 'Application created successfully' })
    @ApiResponse({ status: 409, description: 'Duplicate application for student/program/year' })
    create(@Body() createApplicationDto: CreateApplicationDto) {
        return this.applicationsService.create(createApplicationDto);
    }

    @Get()
    @RequirePermissions({ module: 'Applications', action: 'view' }, { module: 'Applications', action: 'view_all' })
    @ApiOperation({ summary: 'Get all applications with pagination and filtering' })
    @ApiResponse({ status: 200, description: 'Paginated list of applications' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 25)' })
    @ApiQuery({ name: 'search', required: false, description: 'Search by app name, student name/email, program' })
    @ApiQuery({ name: 'stage', required: false, description: 'Filter by stage' })
    @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
    @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
    @ApiQuery({ name: 'academicYearId', required: false, description: 'Filter by academic year' })
    @ApiQuery({ name: 'semesterId', required: false, description: 'Filter by semester' })
    @ApiQuery({ name: 'agentId', required: false, description: 'Filter by agent user ID' })
    @ApiQuery({ name: 'agencyId', required: false, description: 'Filter by agency ID' })
    @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Query() allQuery?: Record<string, any>,
        @Request() req?: any,
    ) {
        const userId = req?.user?.id || req?.user?.sub;
        const assignedToFilter = userId
            ? await resolveViewScope(this.prisma, userId, 'Applications')
            : undefined;

        return this.applicationsService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            sortBy,
            sortOrder,
            assignedToFilter,
            rawQuery: allQuery,
        });
    }

    @Get('stats')
    @RequirePermissions({ module: 'Applications', action: 'view' }, { module: 'Applications', action: 'view_all' })
    @ApiOperation({ summary: 'Get application statistics' })
    @ApiResponse({ status: 200, description: 'Application statistics by stage' })
    getStats() {
        return this.applicationsService.getStats();
    }

    @Get(':id')
    @RequirePermissions({ module: 'Applications', action: 'view' }, { module: 'Applications', action: 'view_all' })
    @ApiOperation({ summary: 'Get an application by ID' })
    @ApiResponse({ status: 200, description: 'Application found with full details' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    findOne(@Param('id') id: string) {
        return this.applicationsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Applications', action: 'edit' })
    @ApiOperation({ summary: 'Update an application' })
    @ApiResponse({ status: 200, description: 'Application updated successfully' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
        return this.applicationsService.update(id, updateApplicationDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Applications', action: 'delete' })
    @ApiOperation({ summary: 'Delete an application' })
    @ApiResponse({ status: 200, description: 'Application deleted successfully' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    remove(@Param('id') id: string) {
        return this.applicationsService.remove(id);
    }
}
