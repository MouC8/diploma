import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateEntity } from 'src/entities/template.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectRepository(TemplateEntity)
    private readonly repo: Repository<TemplateEntity>,
    @Inject('TEMPLATE_EVENTS')
    private readonly client: ClientProxy,
  ) {}

  async findAll(): Promise<TemplateEntity[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<TemplateEntity> {
    const tmpl = await this.repo.findOneBy({ id });
    if (!tmpl) {
      throw new NotFoundException(`Modèle ${id} non trouvé`);
    }
    return tmpl;
  }

  async create(data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    const tmpl = this.repo.create(data);
    const saved = await this.repo.save(tmpl);
    // Emit event
    await firstValueFrom(this.client.emit('template.created', saved));
    this.logger.log(`Emitted template.created for id ${saved.id}`);
    return saved;
  }

  async update(id: number, data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    const result = await this.repo.update(id, data);
    if (result.affected === 0) {
      throw new NotFoundException(`Modèle ${id} non trouvé`);
    }
    const updated = await this.repo.findOneBy({ id });
    if (!updated) {
      throw new NotFoundException(`Modèle ${id} non trouvé après mise à jour`);
    }
    // Emit event
    await firstValueFrom(this.client.emit('template.updated', updated));
    this.logger.log(`Emitted template.updated for id ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Modèle ${id} non trouvé`);
    }
    // Emit event
    await firstValueFrom(this.client.emit('template.removed', { id }));
    this.logger.log(`Emitted template.removed for id ${id}`);
  }
}
