export class OcrResultDto {
  id: string;
  nom: string | null;
  prenom: string | null;
  numeroImmatriculation: string | null;
  dateObtention: string | null;
  rawText: string;
}
