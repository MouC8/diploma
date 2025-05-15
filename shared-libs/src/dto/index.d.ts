export interface DiplomaUploadedPayload {
    id: string;
    filename: string;
    path: string;
    legacy: boolean;
}
export interface DiplomaProcessedPayload {
    id: string;
    cheminImageSource: string;
}
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
export interface OcrResultDto {
    id: string;
    nom: string | null;
    prenom: string | null;
    numeroImmatriculation: string | null;
    dateObtention: string | null;
    rawText: string;
}
export interface QrGeneratedPayload {
    id: string;
    verifyUrl: string;
    qrCodeBase64: string;
}
export interface ImageProcessedPayload {
    id: string;
    imageBase64: string;
}
