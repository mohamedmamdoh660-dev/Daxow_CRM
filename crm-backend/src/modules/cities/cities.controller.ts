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
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Cities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) { }

    @Post()
    @RequirePermissions({ module: 'Countries & Cities', action: 'add' })
    @ApiOperation({ summary: 'Create a new city' })
    @ApiResponse({ status: 201, description: 'City created successfully' })
    create(@Body() createCityDto: CreateCityDto) {
        return this.citiesService.create(createCityDto);
    }

    @Get()
    @RequirePermissions({ module: 'Countries & Cities', action: 'view' }, { module: 'Countries & Cities', action: 'view_all' }, { module: 'Countries & Cities', action: 'menu_access' })
    @ApiOperation({ summary: 'Get all cities' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'countryId', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of cities' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('countryId') countryId?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.citiesService.findAll({
            skip,
            take: pageSize,
            search,
            countryId,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @RequirePermissions({ module: 'Countries & Cities', action: 'view' }, { module: 'Countries & Cities', action: 'view_all' }, { module: 'Countries & Cities', action: 'menu_access' })
    @ApiOperation({ summary: 'Get city by ID' })
    @ApiResponse({ status: 200, description: 'City found' })
    @ApiResponse({ status: 404, description: 'City not found' })
    findOne(@Param('id') id: string) {
        return this.citiesService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Countries & Cities', action: 'edit' })
    @ApiOperation({ summary: 'Update city' })
    @ApiResponse({ status: 200, description: 'City updated successfully' })
    @ApiResponse({ status: 404, description: 'City not found' })
    update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
        return this.citiesService.update(id, updateCityDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Countries & Cities', action: 'delete' })
    @ApiOperation({ summary: 'Delete city' })
    @ApiResponse({ status: 200, description: 'City deleted successfully' })
    @ApiResponse({ status: 404, description: 'City not found' })
    remove(@Param('id') id: string) {
        return this.citiesService.remove(id);
    }
}
