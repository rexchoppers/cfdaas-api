import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';
import { MasterEncryptionService } from './master-encryption.service';

@Injectable()
export class ProfileEncryptionService {
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    private readonly masterEncryptionService: MasterEncryptionService,
  ) {}

  // 🔐 Encrypt JSON data (string format) using Profile Key
  private encryptProfileData(
    data: string,
    profileEncryptionKey: Buffer,
  ): { encryptedData: string; iv: string; authTag: string } {
    const iv = randomBytes(16); // ✅ Generate a secure IV
    const cipher = createCipheriv(this.algorithm, profileEncryptionKey, iv);

    let encrypted = cipher.update(data, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      encryptedData: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
    };
  }

  private decryptProfileData(
    encryptedData: string,
    iv: string,
    authTag: string,
    profileEncryptionKey: Buffer,
  ): string {
    const decipher = createDecipheriv(
      this.algorithm,
      profileEncryptionKey,
      Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    let decrypted = decipher.update(Buffer.from(encryptedData, 'base64'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  }

  encryptProfile(
    jsonData: string,
    encryptedProfileKey: string,
  ): {
    encryptedProfileData: string;
    encryptedIv: string;
    encryptedAuthTag: string;
  } {
    // 🔓 Step 1: Decrypt the Profile Key using the Master Key (AES-256-CBC)
    const profileEncryptionKeyHex = this.masterEncryptionService.decryptMaster(
      encryptedProfileKey,
      encryptedProfileKey,
    );
    const profileEncryptionKey = Buffer.from(profileEncryptionKeyHex, 'hex'); // Convert to raw bytes

    // 🔐 Step 2: Encrypt JSON with Profile Key (AES-256-GCM)
    const encryptedProfile = this.encryptProfileData(
      jsonData,
      profileEncryptionKey,
    );

    // 🔐 Step 3: Encrypt profileEncryptedData with Master Key (AES-256-CBC)
    const encryptedProfileData = this.masterEncryptionService.encryptMaster(
      encryptedProfile.encryptedData,
    );

    // 🔐 Step 4: Encrypt IV & AuthTag separately with Master Key
    const encryptedIv = this.masterEncryptionService.encryptMaster(
      encryptedProfile.iv,
    );
    const encryptedAuthTag = this.masterEncryptionService.encryptMaster(
      encryptedProfile.authTag,
    );

    return {
      encryptedProfileData, // ✅ Double-encrypted JSON data
      encryptedIv, // ✅ IV encrypted with Master Key
      encryptedAuthTag, // ✅ AuthTag encrypted with Master Key
    };
  }

  decryptProfile(
    encryptedProfileData: string,
    encryptedIv: string,
    encryptedAuthTag: string,
    encryptedProfileKey: string,
  ): string {
    // 🔓 Step 1: Decrypt the Profile Key using the Master Key
    const profileEncryptionKeyHex = this.masterEncryptionService.decryptMaster(
      encryptedProfileKey,
      encryptedProfileKey,
    );
    const profileEncryptionKey = Buffer.from(profileEncryptionKeyHex, 'hex'); // Convert to raw bytes

    // 🔓 Step 2: Decrypt IV & AuthTag using Master Key
    const iv = this.masterEncryptionService.decryptMaster(
      encryptedIv,
      encryptedIv,
    );
    const authTag = this.masterEncryptionService.decryptMaster(
      encryptedAuthTag,
      encryptedAuthTag,
    );

    // 🔓 Step 3: Decrypt the JSON data using Master Key
    const decryptedJsonString = this.masterEncryptionService.decryptMaster(
      encryptedProfileData,
      encryptedProfileData,
    );

    // 🔓 Step 4: Decrypt JSON with Profile Key (AES-256-GCM)
    return this.decryptProfileData(
      decryptedJsonString,
      iv, // ✅ Using decrypted IV
      authTag, // ✅ Using decrypted AuthTag
      profileEncryptionKey, // ✅ Using decrypted Profile Key
    );
  }
}
