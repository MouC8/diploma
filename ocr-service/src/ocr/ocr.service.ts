import { Injectable, Logger, Inject } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OcrResultDto } from './dto/ocr-result.dto';
import { OCR_SERVICE } from '../constants';

@Injectable()
export class OcrService {

  private readonly logger = new Logger(OcrService.name);

  constructor(
    @Inject('OCR_SERVICE') private readonly client: ClientProxy,
  ) {}

  async extractTextAndSave(data: { id: string; resultPath: string }) {
    this.logger.log(`Extracting OCR for ${data.id}`);
    // … appel OCR, sauvegarde en base …
    // (Optionnel : émettre un event de résultat)
    // await this.client.emit('diploma.ocr.completed', { id: data.id, text: '...' });
  }
  async extractText(imagePath: string): Promise<OcrResultDto> {
    this.logger.log(`Performing OCR on ${imagePath}`);
    const { data } = await Tesseract.recognize(imagePath, 'fra', {
      logger: m => this.logger.debug(m),
    });

    const rawText = data.text;
    const nomMatch = rawText.match(/Nom[:\s]*([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜ' -]+)/i);
    const prenomMatch = rawText.match(/Prénom[:\s]*([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜ' -]+)/i);
    const matriculeMatch = rawText.match(/Immatriculation[:\s]*(\w+)/i);
    const dateMatch = rawText.match(/Date d['’]obtention[:\s]*(\d{2}\/\d{2}\/\d{4})/i);

    return {
      id: '',
      nom: nomMatch ? nomMatch[1].trim() : null,
      prenom: prenomMatch ? prenomMatch[1].trim() : null,
      numeroImmatriculation: matriculeMatch ? matriculeMatch[1].trim() : null,
      dateObtention: dateMatch ? dateMatch[1] : null,
      rawText,
    };
  }

  async handleImage(record: { id: string; path: string }) {
    const ocrData = await this.extractText(record.path);
    ocrData.id = record.id;
    await firstValueFrom(this.client.emit('diploma.ocr.completed', ocrData));
    this.logger.log(`Emitted diploma.ocr.completed for id=${record.id}`);
  }

  // async extractText(imagePath: string): Promise<OcrResultDto> {
  //   const { data } = await Tesseract.recognize(imagePath, 'fra');
  //   const raw = data.text;
  //   const dto: OcrResultDto = {
  //     id: '',
  //     nom: this.matchField(raw, /Nom[:\s]*([A-ZÉÈ...]+)/i),
  //     prenom: this.matchField(raw, /Prénom[:\s]*([A-ZÉÈ...]+)/i),
  //     numeroImmatriculation: this.matchField(raw, /Immatriculation[:\s]*(\w+)/i),
  //     dateObtention: this.matchField(raw, /Date d['’]obtention[:\s]*(\d{2}\/\d{2}\/\d{4})/i),
  //     rawText: raw
  //   };
  //   return dto;
  // }

  private matchField(text: string, regex: RegExp): string|null {
    const m = text.match(regex);
    return m ? m[1].trim() : null;
  }

  /** Émet l’event OCR complété */
  async emitOcrResult(data: OcrResultDto) {
    await firstValueFrom(this.client.emit('legacy.ocr.completed', data));
    this.logger.log(`Emitted legacy.ocr.completed for ${data.id}`);
  }

  /** Handler d’un upload legacy depuis le controller */
  // async handleImage(record: { id: string; path: string }) {
  //   const ocr = await this.extractText(record.path);
  //   ocr.id = record.id;
  //   await this.emitOcrResult(ocr);
  // }
}
