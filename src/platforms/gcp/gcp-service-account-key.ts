interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

class GCPServiceAccountKey implements ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;

  constructor(serviceAccountData: ServiceAccountKey) {
    this.type = serviceAccountData.type;
    this.project_id = serviceAccountData.project_id;
    this.private_key_id = serviceAccountData.private_key_id;
    this.private_key = serviceAccountData.private_key;
    this.client_email = serviceAccountData.client_email;
    this.client_id = serviceAccountData.client_id;
    this.auth_uri = serviceAccountData.auth_uri;
    this.token_uri = serviceAccountData.token_uri;
    this.auth_provider_x509_cert_url = serviceAccountData.auth_provider_x509_cert_url;
    this.client_x509_cert_url = serviceAccountData.client_x509_cert_url;
  }

  // Helper method to create instance from JSON string
  static fromJSON(jsonString: string): GCPServiceAccountKey {
    const data = JSON.parse(jsonString);
    return new GCPServiceAccountKey(data);
  }

  // Helper method to convert to JSON string
  toJSON(): string {
    return JSON.stringify(this);
  }
}
