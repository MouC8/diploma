import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('DIPLOMA_SERVICE') private readonly client: ClientProxy,
  ) {}

  async upload(file: Express.Multer.File) {
    // send file metadata to diplomas-service
    const payload = { filename: file.filename, path: file.path };
    await firstValueFrom(this.client.emit('diploma.uploaded', payload));
    return { success: true, message: 'Upload event emitted' };
  }

  async create(dto: any) {
    // send creation command
    const response$ = this.client.send('diploma.create', dto);
    return firstValueFrom(response$);
  }
}