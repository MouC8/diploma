import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async onModuleInit(): Promise<void> {
    try {
      await super.onModuleInit();
    } catch (error) {
      console.warn(
        'CustomThrottlerGuard: Métadonnées de throttling non définies, initialisation par défaut.'
      );
      // Remplacez "rules" par la propriété appropriée si nécessaire
      (this as any).rules = [];
    }
  }
}
