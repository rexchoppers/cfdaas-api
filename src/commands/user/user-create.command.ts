import { Command, CommandRunner, Option } from 'nest-commander';

@Command({
  name: 'user:create',
  arguments: '<email> <firstName> <lastName>',
  description: 'Create new CFDAAS user',
})
export class UserCreateCommand extends CommandRunner {
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    console.log('Called');
    console.log(passedParams, options);
  }
}
