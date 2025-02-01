import { Command, CommandRunner } from 'nest-commander';
import { UserService } from 'src/services/user.service';

@Command({
  name: 'user:create',
  arguments: '<email> <password> <firstName> <lastName>',
  description: 'Create new CFDAAS user',
})

//   constructor(@Inject('DYNAMODB_CLIENT') private readonly dynamoDBClient: DynamoDBClient) {}
export class UserCreateCommand extends CommandRunner {
  constructor(private readonly userService: UserService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const email = passedParams[0];
    const password = passedParams[1];
    const firstName = passedParams[2];
    const lastName = passedParams[3];

    try {
      // Create user in database
      const user = await this.userService.createUser({
        email,
        firstName,
        lastName,
        cognito: {
          password,
          verified: true,
        },
      });

      console.log('User created', {
        data: user,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
