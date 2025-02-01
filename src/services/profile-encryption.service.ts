import { Injectable } from '@nestjs/common';
import {
  CipherGCM,
  createCipheriv,
  createDecipheriv,
  DecipherGCM,
  randomBytes,
} from 'crypto';
import { MasterEncryptionService } from './master-encryption.service';

@Injectable()
export class ProfileEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly masterKey: Buffer;

  constructor(
    private readonly masterEncryptionService: MasterEncryptionService,
  ) {}

  private encryptProfileDataLayer(
    data: string,
    profileEncryptionKey: string,
  ): { encryptedData: string; iv: string; authTag: string } {
    const iv = Buffer.alloc(16, 0); // Using a zero IV for deterministic encryption per user
    const cipher: CipherGCM = createCipheriv(
      'aes-256-gcm',
      Buffer.from(profileEncryptionKey, 'hex'),
      iv,
    ) as CipherGCM; // ✅ Explicitly type as CipherGCM

    let encrypted = cipher.update(data, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      encryptedData: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  private decryptProfileDataLayer(
    encryptedData: string,
    iv: string,
    authTag: string,
    profileEncryptionKey: string,
  ): string {
    const decipher: DecipherGCM = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(profileEncryptionKey, 'hex'),
      Buffer.from(iv, 'hex'),
    ) as DecipherGCM; // ✅ Explicitly type as DecipherGCM
    decipher.setAuthTag(Buffer.from(authTag, 'hex')); // ✅ Ensure setAuthTag() is recognized

    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  }

  encryptProfile(
    data: string,
    profileEncryptionKey: string,
  ): {
    encryptedData: string;
    iv: string;
    authTag: string;
    encryptedProfileKey: string;
  } {
    // 🔐 Step 1: Encrypt profile data using AES-256-GCM
    const encryptedProfile = this.encryptProfileDataLayer(
      data,
      profileEncryptionKey,
    );

    // 🔐 Step 2: Encrypt the already encrypted profile data using Master Encryption (AES-256-CBC)
    const doubleEncryptedProfileData =
      this.masterEncryptionService.encryptMaster(
        encryptedProfile.encryptedData,
      );

    // 🔑 Step 3: Encrypt `profileEncryptionKey` using Master Encryption (AES-256-CBC)
    const encryptedProfileKey =
      this.masterEncryptionService.encryptMaster(profileEncryptionKey);

    return {
      encryptedData: doubleEncryptedProfileData,
      iv: encryptedProfile.iv,
      authTag: encryptedProfile.authTag,
      encryptedProfileKey, // ✅ This will be stored in MongoDB
    };
  }

  // ✅ Public Method: Decrypt Profile Data
  decryptProfile(
    encryptedData: string,
    iv: string,
    authTag: string,
    encryptedProfileKey: string,
  ): string {
    // 🔓 Step 1: Decrypt the encrypted profile data using Master Encryption Service (AES-256-CBC)
    const decryptedEncryptedProfileData =
      this.masterEncryptionService.decryptMaster(encryptedData, encryptedData);

    // 🔓 Step 2: Decrypt `profileEncryptionKey` using Master Encryption Service (AES-256-CBC)
    const decryptedProfileKey = this.masterEncryptionService.decryptMaster(
      encryptedProfileKey,
      encryptedProfileKey,
    );

    // 🔓 Step 3: Decrypt profile data using AES-256-GCM with the decrypted profile key
    return this.decryptProfileDataLayer(
      decryptedEncryptedProfileData,
      iv,
      authTag,
      decryptedProfileKey,
    );
  }
}
