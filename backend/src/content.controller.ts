import { Controller, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { RolesGuard } from './auth/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('content')
export class ContentController {
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin', 'editor'])
  getContent() {
    return { message: 'Content for admin and editor' };
  }
}
