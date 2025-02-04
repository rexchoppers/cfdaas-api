import { Injectable } from '@nestjs/common';
import {
  CreateSecretCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsSecretsManagerService {
  private readonly client: SecretsManagerClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SecretsManagerClient({
      region: this.configService.get<string>('SECRETS_MANAGER_REGION'),
    });
  }

  async createSecret(secretName: string, secretValue: string): Promise<string> {
    try {
      if (typeof secretValue !== 'string') {
        throw new Error('❌ Secret value must be a stringified JSON object');
      }

      const command = new CreateSecretCommand({
        Name: secretName,
        SecretString: secretValue, // ✅ Directly use the string
      });

      const response = await this.client.send(command);

      console.log(`✅ Secret "${secretName}" created successfully!`);
      return response.ARN;
    } catch (error) {
      console.error(`❌ Error creating secret "${secretName}":`, error);
      throw error;
    }
  }
}
