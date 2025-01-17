import { Command, CommandRunner, Option } from 'nest-commander';

@Command({
  name: 'user:create',
  description: 'Create new CFDAAS user',
})
export class UserCreateCommand extends CommandRunner {
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    console.log(passedParams, options);
  }
}
