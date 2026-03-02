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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import { resolveViewScope } from '../../common/helpers/view-scope.helper';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leads')
export class LeadsController {
    constructor(
        private readonly leadsService: LeadsService,
        private readonly prisma: PrismaService,
    ) { }

    @Post()
    @RequirePermissions({ module: 'Leads', action: 'add' })
    @ApiOperation({ summary: 'Create a new lead' })
    @ApiResponse({ status: 201, description: 'Lead created successfully' })
    create(@Body() createLeadDto: CreateLeadDto) {
        return this.leadsService.create(createLeadDto);
    }

    @Get()
    @RequirePermissions({ module: 'Leads', action: 'view' }, { module: 'Leads', action: 'view_all' })
    @ApiOperation({ summary: 'Get all leads' })
    @ApiResponse({ status: 200, description: 'List of all leads' })
    async findAll(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('search') search: string,
        @Request() req: any,
    ) {
        const userId = req.user?.id || req.user?.sub;
        const ownerFilter = await resolveViewScope(this.prisma, userId, 'Leads');
        return this.leadsService.findAll(
            page ? Number(page) : 1,
            pageSize ? Number(pageSize) : 10,
            search,
            ownerFilter,
        );
    }

    @Get(':id')
    @RequirePermissions({ module: 'Leads', action: 'view' }, { module: 'Leads', action: 'view_all' })
    @ApiOperation({ summary: 'Get a lead by ID' })
    @ApiResponse({ status: 200, description: 'Lead found' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    findOne(@Param('id') id: string) {
        return this.leadsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Leads', action: 'edit' })
    @ApiOperation({ summary: 'Update a lead' })
    @ApiResponse({ status: 200, description: 'Lead updated successfully' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
        return this.leadsService.update(id, updateLeadDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Leads', action: 'delete' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a lead' })
    @ApiResponse({ status: 204, description: 'Lead deleted successfully' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    remove(@Param('id') id: string) {
        return this.leadsService.remove(id);
    }

    @Post(':id/convert')
    @RequirePermissions({ module: 'Leads', action: 'edit' })
    @ApiOperation({ summary: 'Convert lead to student' })
    @ApiResponse({ status: 201, description: 'Lead converted to student successfully' })
    @ApiResponse({ status: 400, description: 'Invalid lead type or already converted' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    convertToStudent(@Param('id') id: string) {
        return this.leadsService.convertToStudent(id);
    }
}
