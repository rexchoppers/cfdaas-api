import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Platform, CredentialType } from '../types/profile.types';
import { User } from './user.entity';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  // Created embedded user for createdBy as a user can be deleted
  @Prop({ type: User })
  createdBy: User;

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

  @Prop()
  credentialsSecretId: string;

  @Prop()
  region?: string;

  @Prop()
  projectId?: string;

  @Prop()
  accountId?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
