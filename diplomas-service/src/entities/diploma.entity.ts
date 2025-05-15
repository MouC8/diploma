import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('diplomes')
@Unique(['numeroImmatriculation'])


export class DiplomaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom: string;

  @Column({ type: 'varchar' })
  prenom: string;

  @Column({ type: 'date', nullable: true })
  dateNaissance: string | null;

  // Spécifier explicitement le type "varchar" pour forcer TypeORM à utiliser un type supporté par MySQL.
  @Column({ type: 'varchar', nullable: true })
  lieuNaissance: string | null;

  @Column({ name: 'numero_immatriculation', type: 'varchar', nullable: true })
  numeroImmatriculation: string | null;

  @Column({ type: 'varchar' })
  filiere: string;

  @Column({ type: 'varchar', nullable: true })
  mention: string | null;

  @Column({ type: 'date', name: 'date_obtention', nullable: true })
  dateObtention: string | null;

  @Column({ type: 'varchar' })
  etablissement: string;

  @Column({ name: 'url_verification', type: 'varchar' })
  urlVerification: string;

  @Column({ name: 'chemin_image_originale_ou_generee', type: 'varchar', nullable: true })
  cheminImageSource: string | null;

  @Column({ name: 'chemin_image_modifiee', type: 'varchar', nullable: true })
  cheminImageModifiee: string | null;

  @Column({ type: 'text', name: 'qr_code_data', nullable: true })
  qrCodeData: string | null;

  @Column({
    type: 'enum',
    enum: ['SCANNE', 'GENERE'],
    name: 'type_source',
  })
  typeSource: 'SCANNE' | 'GENERE';

  @Column({ name: 'modele_diplome_id', type: 'int', nullable: true })
  modeleDiplomeId: number | null;

  @CreateDateColumn({ name: 'date_creation_enregistrement' })
  dateCreationEnregistrement: Date;

  @UpdateDateColumn({ name: 'date_modification_enregistrement' })
  dateModificationEnregistrement: Date;

  @Column({ type: 'boolean', default: false })
  legacy: boolean;

  @Column({ type: 'boolean', default: false })
  legacyValidated: boolean;
}
