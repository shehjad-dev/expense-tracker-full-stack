import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    dotenv.config();
    this.envConfig = Object.keys(process.env).reduce((acc, key) => {
      if (process.env[key] !== undefined) {
        acc[key] = process.env[key] as string;
      }
      return acc;
    }, {} as { [key: string]: string });
  }

  //   get(key: string): string {
  //     return this.envConfig[key] as string;
  //   }

  //   get mongoUri(): string {
  //     return this.get('MONGO_URI');
  //   }

  //   get mongoDbName(): string {
  //     return this.get('MONGO_DB_NAME');
  //   }

  //   get openAiApiKey(): string {
  //     return this.get('OPENAI_API_KEY');
  //   }

  //   get resendApiKey(): string {
  //     return this.get('RESEND_API_KEY');
  //   }

  //   get clerkSigningSecret(): string {
  //     return this.get('CLERK_SIGNING_SECRET');
  //   }
}
