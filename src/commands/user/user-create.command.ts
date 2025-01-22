import { Command, CommandRunner } from 'nest-commander';
import { UserService } from 'src/services/user.service';

@Command({
  name: 'user:create',
  arguments: '<email> <firstName> <lastName>',
  description: 'Create new CFDAAS user',
})
export class UserCreateCommand extends CommandRunner {
  constructor(private readonly userService: UserService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const email = passedParams[0];
    const firstName = passedParams[1];
    const lastName = passedParams[2];

    console.log(this.userService);

    const user = await this.userService.createUser({
      email,
      firstName,
      lastName,
    });

    console.log(user);

    console.log('Called');
    console.log(passedParams, options);
  }
}
