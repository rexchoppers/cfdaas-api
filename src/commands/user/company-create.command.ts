import { Command, CommandRunner } from 'nest-commander';
import { UserService } from 'src/services/user.service';
import { CompanyService } from '../../services/company.service';
import { AccessService } from '../../services/access.service';

@Command({
  name: 'company:create',
  arguments: '<name> <ownerEmail|ownerId>',
  description: 'Create new CFDAAS Company',
})
export class CompanyCreateCommand extends CommandRunner {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const name = passedParams[0];
    const ownerIdentifier = passedParams[1];

    const user = await this.userService.getUser({
      [ownerIdentifier.includes('@') ? 'email' : 'id']: ownerIdentifier,
    });

    if (!user) {
      console.error('User not found to link company to owner');
      return;
    }

    const company = await this.companyService.createCompany({
      name,
      owner: user,
    });

    // Create Access
    await this.accessService.addAccess(user.id, company.id, 'owner');

    console.log('Company created:', company);
  }
}
