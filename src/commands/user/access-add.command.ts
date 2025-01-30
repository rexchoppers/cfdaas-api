import { Command, CommandRunner } from 'nest-commander';
import { UserService } from 'src/services/user.service';
import { CompanyService } from '../../services/company.service';
import { AccessService } from '../../services/access.service';
import { AccessLevel } from '../../entities/access.entity';

@Command({
  name: 'access:add',
  arguments: '<email|id> <id> <level>',
  description: 'Add access to a company for a user',
})
export class AccessAddCommand extends CommandRunner {
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
    try {
      // Either MongoDB ID or email
      const identifier = passedParams[0];

      // Company ID
      const companyId = passedParams[1];

      // Level
      const level = passedParams[2];

      // Find out if the identifier is an email or an ID
      const user = await this.userService.getUser({
        [identifier.includes('@') ? 'email' : 'id']: identifier,
      });

      if (!user) {
        console.error('User not found');
        return;
      }

      // Get company
      const company = await this.companyService.getCompany(companyId);

      if (!company) {
        console.error('Company not found');
      }

      // Check if the user already has access to the company
      const existingAccess = await this.accessService.getAccess(
        user.id,
        company.id,
      );

      if (existingAccess) {
        console.error('User already has access to the company');
        return;
      }

      // Check if role is valid
      if (!['owner', 'admin', 'editor', 'viewer'].includes(level)) {
        console.error('Invalid level');
        return;
      }

      // Add access
      await this.accessService.addAccess(
        user.id,
        company.id,
        level as AccessLevel,
      );

      console.log('Access added');
    } catch (error) {
      console.error(error);
    }
  }
}
