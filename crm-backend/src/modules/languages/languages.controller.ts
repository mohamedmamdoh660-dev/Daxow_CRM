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
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Languages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('languages')
export class LanguagesController {
    constructor(private readonly languagesService: LanguagesService) { }

    @Post()
    @RequirePermissions({ module: 'Languages & Titles', action: 'add' })
    @ApiOperation({ summary: 'Create a new language' })
    @ApiResponse({ status: 201, description: 'Language created successfully' })
    create(@Body() createLanguageDto: CreateLanguageDto) {
        return this.languagesService.create(createLanguageDto);
    }

    @Get()
    @RequirePermissions({ module: 'Languages & Titles', action: 'view' }, { module: 'Languages & Titles', action: 'view_all' })
    @ApiOperation({ summary: 'Get all languages' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of languages' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.languagesService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @RequirePermissions({ module: 'Languages & Titles', action: 'view' }, { module: 'Languages & Titles', action: 'view_all' })
    @ApiOperation({ summary: 'Get language by ID' })
    @ApiResponse({ status: 200, description: 'Language found' })
    @ApiResponse({ status: 404, description: 'Language not found' })
    findOne(@Param('id') id: string) {
        return this.languagesService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Languages & Titles', action: 'edit' })
    @ApiOperation({ summary: 'Update language' })
    @ApiResponse({ status: 200, description: 'Language updated successfully' })
    @ApiResponse({ status: 404, description: 'Language not found' })
    update(@Param('id') id: string, @Body() updateLanguageDto: UpdateLanguageDto) {
        return this.languagesService.update(id, updateLanguageDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Languages & Titles', action: 'delete' })
    @ApiOperation({ summary: 'Delete language' })
    @ApiResponse({ status: 200, description: 'Language deleted successfully' })
    @ApiResponse({ status: 404, description: 'Language not found' })
    remove(@Param('id') id: string) {
        return this.languagesService.remove(id);
    }
}
