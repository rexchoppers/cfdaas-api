import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: false })
  firstName: string;

  @Prop({ required: true, unique: false })
  lastName: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true, unique: true })
  cognitoId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
