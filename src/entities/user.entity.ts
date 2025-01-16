import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  firstName: string;

  @Prop({ required: true, unique: true })
  lastName: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Company' })
  companies: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);