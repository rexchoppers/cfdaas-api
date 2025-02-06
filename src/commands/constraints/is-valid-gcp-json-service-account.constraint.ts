import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidGCPJson', async: false })
export class IsValidGCPJsonServiceAccountConstraint
  implements ValidatorConstraintInterface
{
  validate(base64Data: string): boolean {
    try {
      const jsonData = JSON.parse(
        Buffer.from(base64Data, 'base64').toString('utf8'),
      );

      // Ensure required GCP fields exist
      return (
        jsonData.type === 'service_account' &&
        typeof jsonData.project_id === 'string' &&
        typeof jsonData.private_key === 'string' &&
        typeof jsonData.client_email === 'string'
      );
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Invalid GCP JSON credentials provided. Ensure the file is base64-encoded and matches GCP service account format.';
  }
}
