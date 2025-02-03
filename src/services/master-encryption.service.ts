import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { randomBytes } from 'crypto';

@Injectable()
export class MasterEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_MASTER_KEY');

    if (!key) {
      throw new Error(
        '❌ MASTER_ENCRYPTION_KEY is not set in environment variables',
      );
    }

    // Decode Base64 key into Buffer
    this.masterKey = Buffer.from(key, 'base64');

    if (this.masterKey.length !== 32) {
      throw new Error(
        '❌ MASTER_ENCRYPTION_KEY must be a 32-byte Base64 encoded string',
      );
    }
  }

  // 🔑 Derive IV using SHA-256 hash of the data
  private deriveIV(data: string): Buffer {
    return createHash('sha256').update(data).digest().subarray(0, 16);
  }

  // 🔐 Encrypt data using AES-256-CBC and return Base64
  encryptMaster(data: string): string {
    const iv = this.deriveIV(data);
    const cipher = createCipheriv(this.algorithm, this.masterKey, iv);

    let encrypted = cipher.update(data, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('base64'); // ✅ Return Base64 instead of Hex
  }

  // 🔓 Decrypt Base64-encoded data using AES-256-CBC
  decryptMaster(encryptedData: string, originalData: string): string {
    const iv = this.deriveIV(originalData);
    const decipher = createDecipheriv(this.algorithm, this.masterKey, iv);

    let decrypted = decipher.update(Buffer.from(encryptedData, 'base64'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  }
}
