
export interface DiplomaUploadedPayload {
    id: string;
    filename: string;
    path: string;
    legacy: boolean;
  }
  
  /**
   * Payload for diploma.uploaded.processed event
   */
  export interface DiplomaProcessedPayload {
    id: string;
    cheminImageSource: string;
  }
  
  /**
   * Payload for diploma.create command
   */
  export interface CreateDiplomaDto {
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;
    numeroImmatriculation: string;
    filiere: string;
    mention?: string;
    dateObtention: string;
    etablissement: string;
    modeleDiplomeId?: number;
    cheminImageModifiee?: string;
    qrCodeData?: string;
  }
  
  /**
   * Payload for diploma.ocr.completed event
   */
  export interface OcrResultDto {
    id: string;
    nom: string | null;
    prenom: string | null;
    numeroImmatriculation: string | null;
    dateObtention: string | null;
    rawText: string;
  }
  
  /**
   * Payload for diploma.qr.generated event
   */
  export interface QrGeneratedPayload {
    id: string;
    verifyUrl: string;
    qrCodeBase64: string;
  }
  
  /**
   * Payload for diploma.image.processed event
   */
  export interface ImageProcessedPayload {
    id: string;
    imageBase64: string;
  }
  
  
  
 