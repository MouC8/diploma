// File: ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'diplomas-service',
        cwd: './diplomas-service',
        script: 'npm',
        args: 'run start:dev',
        watch: false
      },
      {
        name: 'ocr-service',
        cwd: './ocr-service',
        script: 'npm',
        args: 'run start:dev',
        watch: false
      },
      {
        name: 'qr-service',
        cwd: './qr-service',
        script: 'npm',
        args: 'run start:dev',
        watch: false
      },
      {
        name: 'image-service',
        cwd: './image-service',
        script: 'npm',
        args: 'run start:dev',
        watch: false
      },
      {
        name: 'templates-service',
        cwd: './templates-service',
        script: 'npm',
        args: 'run start:dev',
        watch: false
      },
      {
        name: 'api-gateway',
        cwd: './api-gateway',
        script: 'npm',
        args: 'run start:dev',
        watch: false
      }
    ]
  };
  