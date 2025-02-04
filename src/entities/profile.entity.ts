import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type Platform = 'gcp' | 'aws';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['gcp', 'aws'],
    default: 'viewer',
  })
  platform: Platform;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
