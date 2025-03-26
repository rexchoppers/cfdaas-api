export enum Platform {
    GCP = 'gcp',
    AWS = 'aws',
    AZURE = 'azure'
  }

export enum CredentialType {
  // GCP types
  GCP_SERVICE_ACCOUNT = 'service_account',
  GCP_OAUTH2 = 'oauth2',
  // AWS types
  AWS_ACCESS_KEY = 'access_key',
  AWS_ROLE_ARN = 'role_arn',
  // Add other types as needed
}

// Type guard to check valid credential types per platform
export const isValidCredentialTypeForPlatform = (platform: Platform, type: CredentialType): boolean => {
  switch (platform) {
    case Platform.GCP:
      return [CredentialType.GCP_SERVICE_ACCOUNT, CredentialType.GCP_OAUTH2].includes(type);
    case Platform.AWS:
      return [CredentialType.AWS_ACCESS_KEY, CredentialType.AWS_ROLE_ARN].includes(type);
    default:
      return false;
  }
};