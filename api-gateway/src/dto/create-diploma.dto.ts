import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDiplomaDto {
  @IsString() @IsNotEmpty()
  prenom: string;

  @IsString() @IsNotEmpty()
  nom: string;

  // add other fields as needed
}

// File: api-gateway/Dockerfile


// FROM node:18-alpine
// WORKDIR /usr/src/app
// COPY package*.json ./
// RUN npm install --production
// COPY . .
// RUN npm run build
// EXPOSE 4000
// CMD ["node", "dist/main.js"]
