import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccessLevel = 'admin' | 'editor' | 'viewer';

@Schema({ timestamps: true })
export class Access extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer',
  })
  level: AccessLevel;
}

export const AccessSchema = SchemaFactory.createForClass(Access);
