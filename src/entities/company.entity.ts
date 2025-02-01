import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ required: true })
  profileEncryptionKey: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
