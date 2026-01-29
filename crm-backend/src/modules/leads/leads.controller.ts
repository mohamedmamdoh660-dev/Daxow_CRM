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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new lead' })
    @ApiResponse({ status: 201, description: 'Lead created successfully' })
    create(@Body() createLeadDto: CreateLeadDto) {
        return this.leadsService.create(createLeadDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all leads' })
    @ApiResponse({ status: 200, description: 'List of all leads' })
    findAll(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('search') search: string,
    ) {
        return this.leadsService.findAll(
            page ? Number(page) : 1,
            pageSize ? Number(pageSize) : 10,
            search,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a lead by ID' })
    @ApiResponse({ status: 200, description: 'Lead found' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    findOne(@Param('id') id: string) {
        return this.leadsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a lead' })
    @ApiResponse({ status: 200, description: 'Lead updated successfully' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
        return this.leadsService.update(id, updateLeadDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a lead' })
    @ApiResponse({ status: 204, description: 'Lead deleted successfully' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    remove(@Param('id') id: string) {
        return this.leadsService.remove(id);
    }

    @Post(':id/convert')
    @ApiOperation({ summary: 'Convert lead to student' })
    @ApiResponse({ status: 201, description: 'Lead converted to student successfully' })
    @ApiResponse({ status: 400, description: 'Invalid lead type or already converted' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    convertToStudent(@Param('id') id: string) {
        return this.leadsService.convertToStudent(id);
    }
}
