// File: templates-service/src/templates.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplateEntity } from 'src/entities/template.entity';

@Controller('api/templates')
export class TemplatesController {
  constructor(private svc: TemplatesService) {}

  @Get()
  findAll(): Promise<TemplateEntity[]> {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TemplateEntity> {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    return this.svc.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<TemplateEntity>
  ): Promise<TemplateEntity> {
    return this.svc.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.svc.remove(id);
  }
}