import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new application' })
    @ApiResponse({ status: 201, description: 'Application created successfully' })
    create(@Body() createApplicationDto: CreateApplicationDto) {
        return this.applicationsService.create(createApplicationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all applications' })
    @ApiResponse({ status: 200, description: 'List of all applications' })
    @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
    @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
    findAll(
        @Query('studentId') studentId?: string,
        @Query('programId') programId?: string,
    ) {
        if (studentId) {
            return this.applicationsService.findByStudent(studentId);
        }
        if (programId) {
            return this.applicationsService.findByProgram(programId);
        }
        return this.applicationsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an application by ID' })
    @ApiResponse({ status: 200, description: 'Application found with full details' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    findOne(@Param('id') id: string) {
        return this.applicationsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an application' })
    @ApiResponse({ status: 200, description: 'Application updated successfully' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
        return this.applicationsService.update(id, updateApplicationDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an application' })
    @ApiResponse({ status: 200, description: 'Application deleted successfully' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    remove(@Param('id') id: string) {
        return this.applicationsService.remove(id);
    }
}
