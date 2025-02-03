import { Authentication } from '@nestjs-cognito/auth';
import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { AccessService } from 'src/services/access.service';
import { MasterEncryptionService } from '../services/master-encryption.service';

@Controller('profile')
@Authentication()
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
    private readonly masterEncryptionService: MasterEncryptionService,
  ) {}
}
