import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import {
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { AccessService } from 'src/services/access.service';
import { randomBytes } from 'crypto';
import { CompanyResponse } from '../responses/company.response';
import { plainToInstance } from 'class-transformer';

@Controller('company')
@Authentication()
export class CompanyController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
  ) {}

  @Get('/:companyId')
  async getCompany(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ): Promise<CompanyResponse> {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    if (!company) {
      throw new ForbiddenException();
    }

    const access = await this.accessService.getAccess(user.id, company.id);

    if (!access) {
      throw new ForbiddenException();
    }

    return plainToInstance(CompanyResponse, company, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/:companyId/encryption/generate')
  async generateEncryption(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ): Promise<{
    data: {
      success: boolean;
    };
  }> {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    const access = await this.accessService.getAccess(user.id, company.id);

    if (!access) {
      throw new ForbiddenException();
    }

    // Check all the encryption keys
    if (company.profileEncryptionKey) {
      throw new ConflictException({
        message: 'Profile encryption key already exists',
      });
    }

    // Generate the encryption key
    const profileEncryptionKey = randomBytes(32).toString('hex');

    console.log('Generated key:', profileEncryptionKey);
    console.log(
      'Generated key (Raw):',
      Buffer.from(profileEncryptionKey, 'hex'),
    );

    // Encrypt the key with the master encryption key
    const encryptedProfileEncryptionKey =
      this.masterEncryptionService.encryptMaster(profileEncryptionKey);

    console.log('Encrypted key:', encryptedProfileEncryptionKey);

    // Save the encrypted key to the company
    await this.companyService.updateCompany(company.id, {
      profileEncryptionKey: encryptedProfileEncryptionKey,
    });

    const decryptedProfileKeyHex = this.masterEncryptionService.decryptMaster(
      encryptedProfileEncryptionKey,
      profileEncryptionKey,
    );
    const decryptedProfileKey = Buffer.from(decryptedProfileKeyHex, 'hex'); // Convert back to raw bytes

    console.log('Decrypted Profile Encryption Key (Raw):', decryptedProfileKey);

    return {
      data: {
        success: true,
      },
    };
  }
}
