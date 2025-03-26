import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

type Platform = 'gcp' | 'aws' | 'azure';
type GCPCredentialType = 'service_account' | 'oauth2';
type AWSCredentialType = 'access_key' | 'role_arn';
type CredentialType = GCPCredentialType | AWSCredentialType;

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({
    type: 'enum',
    enum: ['gcp', 'aws', 'azure'],
  })
  platform: Platform;

  @Prop({
    type: 'enum',
    enum: ['service_account', 'oauth2', 'access_key', 'role_arn'],
  })
  type: CredentialType;

  @Prop({ required: true })
  name: string;

  @Prop({ nullable: true })
  description?: string;

  @Prop()
  credentialsSecretId: string;

  @Prop({ nullable: true })
  region?: string;

  @Prop({ nullable: true })
  projectId?: string;

  @Prop({ nullable: true })
  accountId?: string;  
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
