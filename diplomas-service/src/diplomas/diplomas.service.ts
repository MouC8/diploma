import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiplomaEntity } from 'src/entities/diploma.entity';
import { ClientProxy, Payload, RmqContext, Ctx, EventPattern, MessagePattern } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DiplomaUploadedPayload,
  OcrResultDto,
  QrGeneratedPayload,
  ImageProcessedPayload
} from '../../../shared-libs/src/dto/index';

@Injectable()
export class DiplomasService {
  private readonly logger = new Logger(DiplomasService.name);

  constructor(
    @InjectRepository(DiplomaEntity)
    private diplomaRepo: Repository<DiplomaEntity>,
    @Inject('RESULTS_SERVICE') private readonly client: ClientProxy,
  ) {}
// RPC pour GET /api/legacy/:id
@MessagePattern('legacy.get')
async rpcGetLegacy(id: string): Promise<DiplomaEntity | null> {
  return this.diplomaRepo.findOneBy({ id, legacy: true });
}

// Handle upload event
@EventPattern('legacy.uploaded')
async onLegacyUploaded(
  @Payload() payload: DiplomaUploadedPayload,
  @Ctx() ctx: RmqContext,
) {
  this.logger.log(`legacy.uploaded for ${payload.id}`);
  await this.processUpload({ ...payload, legacy: true });
  ctx.getChannelRef().ack(ctx.getMessage());
}

// Handle manual OCR validation
@EventPattern('legacy.ocr.completed')
async onLegacyOcrCompleted(
  @Payload() dto: OcrResultDto,
  @Ctx() ctx: RmqContext,
) {
  this.logger.log(`legacy.ocr.completed for ${dto.id}`);
  await this.updateWithOcrData(dto.id, dto);
  ctx.getChannelRef().ack(ctx.getMessage());
}

// Trigger QR generation
@EventPattern('legacy.qr.requested')
async onLegacyQrRequested(
  @Payload() { id }: { id: string },
  @Ctx() ctx: RmqContext,
) {
  this.logger.log(`legacy.qr.requested for ${id}`);
  // forward to QR service
  await firstValueFrom(this.client.emit('legacy.qr.generate', { id }));
  ctx.getChannelRef().ack(ctx.getMessage());
}

// Save QR data if needed (or simply ack)
@EventPattern('legacy.qr.generated')
async onLegacyQrGenerated(
  @Payload() payload: QrGeneratedPayload,
  @Ctx() ctx: RmqContext,
) {
  this.logger.log(`legacy.qr.generated for ${payload.id}`);
  await this.updateWithQrData(payload.id, {
    urlVerification: payload.verifyUrl,
    qrCodeData: payload.qrCodeBase64,
  });
  ctx.getChannelRef().ack(ctx.getMessage());
}

// Handle final image
@EventPattern('legacy.image.processed')
async onLegacyImageProcessed(
  @Payload() payload: ImageProcessedPayload,
  @Ctx() ctx: RmqContext,
) {
  this.logger.log(`legacy.image.processed for ${payload.id}`);
  const path = `/storage/legacy/${payload.id}-final.png`;
  await this.updateWithImageData(payload.id, { cheminImageModifiee: path });
  ctx.getChannelRef().ack(ctx.getMessage());
}

  /**
   * Traitement initial du fichier uploadé ou legacy upload
   */
  async processUpload(data: { id?: string; filename: string; path: string; legacy?: boolean }): Promise<DiplomaEntity> {
    const base = process.env.VERIFICATION_BASE_URL || 'http://localhost:4000/api/diplomas/view';
    const rec = this.diplomaRepo.create({
      id: data.id, // si legacy, on réutilise l'id fourni
      nom: '',
      prenom: '',
      dateNaissance: null,
      lieuNaissance: null,
      numeroImmatriculation: null,
      filiere: '',
      mention: null,
      dateObtention: null,
      etablissement: '',
      urlVerification: '',
      cheminImageSource: data.path,
      cheminImageModifiee: null,
      qrCodeData: null,
      typeSource: data.legacy ? 'SCANNE' : 'SCANNE',
      modeleDiplomeId: null,
      legacy: !!data.legacy,
      legacyValidated: false,
    } as Partial<DiplomaEntity>);
    const saved = await this.diplomaRepo.save(rec);
    saved.urlVerification = `${base}/${saved.id}`;
    await this.diplomaRepo.save(saved);
    await firstValueFrom(this.client.emit(data.legacy ? 'legacy.uploaded.processed' : 'diploma.uploaded.processed', saved));
    return saved;
  }

  /**
   * Création d'un diplôme généré
   */
  async createDiploma(dto: any): Promise<DiplomaEntity> {
    const base = process.env.VERIFICATION_BASE_URL || 'http://localhost:4000/api/diplomas/view';
    const rec = this.diplomaRepo.create({
      nom: dto.nom,
      prenom: dto.prenom,
      dateNaissance: dto.dateNaissance,
      lieuNaissance: dto.lieuNaissance,
      numeroImmatriculation: dto.numeroImmatriculation,
      filiere: dto.filiere,
      mention: dto.mention,
      dateObtention: dto.dateObtention,
      etablissement: dto.etablissement,
      urlVerification: '',
      cheminImageSource: null,
      cheminImageModifiee: dto.cheminImageModifiee || null,
      qrCodeData: dto.qrCodeData || null,
      typeSource: 'GENERE',
      modeleDiplomeId: dto.modeleDiplomeId,
    } as Partial<DiplomaEntity>);
    const saved = await this.diplomaRepo.save(rec);
    saved.urlVerification = `${base}/${saved.id}`;
    await this.diplomaRepo.save(saved);
    await firstValueFrom(this.client.emit('diploma.created', saved));
    return saved;
  }

  /**
   * Mise à jour des données après OCR
   */
  async updateWithOcrData(id: string, ocrData: Partial<DiplomaEntity>): Promise<DiplomaEntity> {
    await this.diplomaRepo.update(id, { ...ocrData, legacyValidated: true });
    return this.diplomaRepo.findOneBy({ id });
  }

  /**
   * Emission d'un event vers le service QR
   */
  private async emitToQrService(pattern: string, payload: any) {
    await firstValueFrom(this.client.emit(pattern, payload));
    this.logger.log(`Emitted ${pattern} with payload ${JSON.stringify(payload)}`);
  }

  /**
   * Emission d'un event vers le service Image
   */
  private async emitToImageService(pattern: string, payload: any) {
    await firstValueFrom(this.client.emit(pattern, payload));
    this.logger.log(`Emitted ${pattern} with payload ${JSON.stringify(payload)}`);
  }

  /**
   * Mise à jour après génération du QR
   */
  async updateWithQrData(id: string, qrData: { urlVerification: string; qrCodeData: string }): Promise<DiplomaEntity> {
    await this.diplomaRepo.update(id, {
      urlVerification: qrData.urlVerification,
      qrCodeData: qrData.qrCodeData,
    });
    return this.diplomaRepo.findOneBy({ id });
  }

  /**
   * Mise à jour après superposition de l'image
   */
  async updateWithImageData(id: string, imageData: { cheminImageModifiee: string }): Promise<DiplomaEntity> {
    await this.diplomaRepo.update(id, {
      cheminImageModifiee: imageData.cheminImageModifiee,
    });
    return this.diplomaRepo.findOneBy({ id });
  }

  // EventPattern handlers

  @EventPattern('legacy.uploaded')
  async handleLegacyUpload(
    @Payload() data: any,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Handling legacy.uploaded: ${JSON.stringify(data)}`);
    await this.processUpload(data);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  @EventPattern('legacy.ocr.completed')
  async handleLegacyVerify(
    @Payload() dto: any,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Handling legacy.ocr.completed: ${dto.id}`);
    await this.updateWithOcrData(dto.id, dto);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  @EventPattern('legacy.qr.requested')
  async handleLegacyQrRequest(
    @Payload() payload: any,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Handling legacy.qr.requested: ${payload.id}`);
    await this.emitToQrService('legacy.qr.generate', payload);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  @EventPattern('legacy.overlay.requested')
  async handleLegacyOverlay(
    @Payload() payload: any,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Handling legacy.overlay.requested: ${payload.id}`);
    await this.emitToImageService('legacy.overlay', payload);
    ctx.getChannelRef().ack(ctx.getMessage());
  }
  /** 
 * Traitement initial du fichier scanné ou legacy
 */
// async processUpload(data: {
//   id?: string;
//   filename: string;
//   path: string;
//   legacy?: boolean;
// }): Promise<DiplomaEntity> {
//   const base = process.env.VERIFICATION_BASE_URL || 'http://localhost:4000/api/diplomas/view';
//   // Création de l’entité (avec un id fourni pour legacy)
//   const rec = this.diplomaRepo.create({
//     id: data.id,
//     cheminImageSource: data.path,
//     typeSource: 'SCANNE',
//     legacy: !!data.legacy,
//     legacyValidated: false,
//     // les autres champs à vide...
//   } as Partial<DiplomaEntity>);
//   const saved = await this.diplomaRepo.save(rec);
//   // Génération de l’URL de vérification
//   saved.urlVerification = `${base}/${saved.id}`;
//   await this.diplomaRepo.save(saved);

//   // Émission de l’event approprié
//   const pattern = data.legacy ? 'legacy.uploaded.processed' : 'diploma.uploaded.processed';
//   await firstValueFrom(this.client.emit(pattern, {
//     id: saved.id,
//     cheminImageSource: saved.cheminImageSource
//   }));
//   return saved;
// }

}
