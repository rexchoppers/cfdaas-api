import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash } from 'crypto';

@Injectable()
export class MasterEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.masterKey = Buffer.from(
      configService.get<string>('ENCRYPTION_MASTER_KEY'),
      'hex',
    );
  }

  private deriveIV(data: string): Buffer {
    return createHash('sha256').update(data).digest().subarray(0, 16);
  }

  encryptMaster(data: string): string {
    const iv = this.deriveIV(data);
    const cipher = createCipheriv(this.algorithm, this.masterKey, iv);

    let encrypted = cipher.update(data, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
  }

  decryptMaster(encryptedData: string, originalData: string): string {
    const iv = this.deriveIV(originalData);
    const decipher = createDecipheriv(this.algorithm, this.masterKey, iv);

    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  }
}
