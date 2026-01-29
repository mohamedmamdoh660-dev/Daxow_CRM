import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(AuthGuard('local'))
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string', example: 'admin@admission-crm.com' },
                password: { type: 'string', example: 'password123' },
            },
        }
    })
    @ApiResponse({ status: 200, description: 'Return JWT access token' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    getProfile(@Request() req) {
        return req.user;
    }
}
