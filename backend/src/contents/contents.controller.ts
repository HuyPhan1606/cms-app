// src/contents/contents.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('contents')
@UseGuards(JwtAuthGuard)
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  async create(@Body() createContentDto: CreateContentDto) {
    const content = await this.contentsService.create(createContentDto);
    return content;
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'editor', 'client')
  @Get()
  async findAll() {
    return this.contentsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'editor', 'client')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contentsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return this.contentsService.update(id, updateContentDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contentsService.remove(id);
  }
}
