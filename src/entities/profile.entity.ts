import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Platform, CredentialType } from '../types/profile.types';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(Platform),
    required: true
  })
  platform: Platform;

  @Prop({
    type: String,
    enum: Object.values(CredentialType),
    required: true
  })
  credentialType: CredentialType;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  credentialsSecretId: string;

  @Prop()
  region?: string;

  @Prop()
  projectId?: string;

  @Prop()
  accountId?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
