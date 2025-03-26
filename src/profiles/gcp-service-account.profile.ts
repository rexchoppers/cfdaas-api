import { Platform } from "src/entities/profile.entity";

export class GCPServiceAccountProfile {
  static readonly platform: Platform = 'gcp';
  static readonly type: string = 'service_account';
  
  file: GCPServiceAccountKey;

  constructor(file: GCPServiceAccountKey) {
    this.file = file;
  }

  // Helper method to create instance from JSON string
  static fromJSON(jsonString: string): GCPServiceAccountProfile {
    const data = JSON.parse(jsonString);
    return new GCPServiceAccountProfile(data);
  }

  // Helper method to convert to JSON string
  toJSON(): string {
    return JSON.stringify({
      platform: GCPServiceAccountProfile.platform,
      type: GCPServiceAccountProfile.type,
      file: this.file
    });
  }
}