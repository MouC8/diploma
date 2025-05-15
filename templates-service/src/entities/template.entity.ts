// File: templates-service/src/entities/template.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
  } from 'typeorm';
  
  @Entity('diplome_modeles')
  @Unique(['nomModele'])
  export class TemplateEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'nom_modele', length: 255 })
    nomModele: string;
  
    @Column({ name: 'description_modele', type: 'text', nullable: true })
    descriptionModele: string;
  
    @Column({
      name: 'type_fichier_modele',
      type: 'enum',
      enum: ['SVG', 'HTML', 'PDF_FORM', 'PNG_TEMPLATE'],
    })
    typeFichierModele: 'SVG' | 'HTML' | 'PDF_FORM' | 'PNG_TEMPLATE';
  
    @Column({ name: 'chemin_fichier_modele', length: 255 })
    cheminFichierModele: string;
  
    @Column({
      name: 'placeholders_def',
      type: 'longtext',
      nullable: true,
      transformer: {
        from: (value: string) => (value ? JSON.parse(value) : null),
        to: (value: any) => (value ? JSON.stringify(value) : null),
      },
    })
    placeholdersDef: Record<string, any>;
  
    @Column({ name: 'actif', default: true })
    actif: boolean;
  
    @CreateDateColumn({ name: 'date_creation' })
    dateCreation: Date;
  
    @UpdateDateColumn({ name: 'date_modification' })
    dateModification: Date;
  }
  