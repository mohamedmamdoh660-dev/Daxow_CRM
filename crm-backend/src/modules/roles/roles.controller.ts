import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @RequirePermissions({ module: 'Roles & Permissions', action: 'add' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @RequirePermissions({ module: 'Roles & Permissions', action: 'view' }, { module: 'Roles & Permissions', action: 'view_all' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @RequirePermissions({ module: 'Roles & Permissions', action: 'view' }, { module: 'Roles & Permissions', action: 'view_all' })
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Roles & Permissions', action: 'edit' })
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Roles & Permissions', action: 'delete' })
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
