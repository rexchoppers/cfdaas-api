import { Injectable } from '@nestjs/common';
import {
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

  generateProfileKey(): string {
    return randomBytes(32).toString('hex');
  }
}
