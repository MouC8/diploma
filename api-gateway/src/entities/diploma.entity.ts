export class DiplomaEntity {
    id: string;
    nom: string;
    prenom: string;
    dateNaissance: string | null;
    lieuNaissance: string | null;
    numeroImmatriculation: string | null;
    filiere: string;
    mention: string | null;
    dateObtention: string;
    etablissement: string;
    urlVerification: string;
    cheminImageSource: string | null;
    cheminImageModifiee: string | null;
    qrCodeData: string | null;
    typeSource: 'SCANNE' | 'GENERE';
    modeleDiplomeId?: number | null;
    legacy: boolean;
    legacyValidated: boolean;
    dateCreationEnregistrement: Date;
    dateModificationEnregistrement: Date;
  }