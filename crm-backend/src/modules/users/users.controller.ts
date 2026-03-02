import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, Query, Request,
    UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { IsString, MinLength } from 'class-validator';

class ResetPasswordDto {
    @IsString()
    @MinLength(6)
    newPassword: string;
}

class TransferDto {
    @IsString()
    transferToId: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @RequirePermissions({ module: 'User Management', action: 'view' }, { module: 'User Management', action: 'view_all' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
        @Query('search') search = '',
        @Query('groupId') groupId = '',
    ) {
        return this.usersService.findAll(page, pageSize, search, groupId);
    }

    @Get(':id')
    @RequirePermissions({ module: 'User Management', action: 'view' }, { module: 'User Management', action: 'view_all' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @RequirePermissions({ module: 'User Management', action: 'add' })
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'User Management', action: 'edit' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Patch(':id/toggle')
    @RequirePermissions({ module: 'User Management', action: 'edit' })
    toggleActive(@Param('id') id: string) {
        return this.usersService.toggleActive(id);
    }

    @Patch(':id/reset-password')
    @RequirePermissions({ module: 'User Management', action: 'edit' })
    resetPassword(@Param('id') id: string, @Body() body: ResetPasswordDto) {
        return this.usersService.resetPassword(id, body.newPassword);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'User Management', action: 'delete' })
    remove(@Param('id') id: string, @Query('transferToId') transferToId?: string) {
        return this.usersService.remove(id, transferToId);
    }
}
