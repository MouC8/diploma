import { Injectable, Logger, Inject } from '@nestjs/common';
import { toString } from 'qrcode';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QrGeneratedPayload } from '../../../shared-libs/src/dto';

interface OcrData {
  id: string;
  nom: string;
  prenom: string;
  numeroImmatriculation: string;
  dateObtention: string;
  rawText: string;
}

interface QrPayload {
  id: string;
  verifyUrl: string;
  qrCodeBase64: string;
}

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(
    @Inject('QR_EVENTS') private readonly client: ClientProxy,
  ) {}

  /**
   * Génère un QR code base64 pour l'URL de vérification et émet l'événement diploma.qr.generated
   */
  async generateAndEmit(data: OcrData) {
    const verifyUrl = `${process.env.VERIFICATION_BASE_URL || 'http://localhost:4000/api/diplomas/view'}/${data.id}`;
    this.logger.log(`Generating QR for ${verifyUrl}`);

    try {
      // Génération du QR code en chaîne base64
      const qrCodeBase64 = await toString(verifyUrl, { type: 'image/png' });

      const payload: QrPayload = { id: data.id, verifyUrl, qrCodeBase64 };
      await firstValueFrom(this.client.emit('diploma.qr.generated', payload));
      this.logger.log(`Emitted diploma.qr.generated for id=${data.id}`);
    } catch (err) {
      this.logger.error(`Failed to generate QR for id=${data.id}`, err.stack);
      // On peut choisir de ré-emit un event d'erreur ou réessayer
    }
  }

   /** Génère un QR code au format base64 pour un legacy */
   async generateQrForLegacy(id: string): Promise<QrGeneratedPayload> {
    const verifyUrl = `${process.env.VERIFICATION_BASE_URL}/api/legacy/${id}`;
    const base64 = await toString(verifyUrl, { type: 'image/png' });
    return { id, verifyUrl, qrCodeBase64: base64 };
  }

  /** Émet l’event QR généré */
  async emitQrGenerated(payload: QrGeneratedPayload) {
    await firstValueFrom(this.client.emit('legacy.qr.generated', payload));
    this.logger.log(`Emitted legacy.qr.generated for ${payload.id}`);
  }
}
