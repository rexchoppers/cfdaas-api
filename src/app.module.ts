import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CompanySchema } from './entities/company.entity';
import { AccessSchema } from './entities/access.entity';
import { UserSchema } from './entities/user.entity';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: 'Company', schema: CompanySchema },
      { name: 'Access', schema: AccessSchema },
      { name: 'User', schema: UserSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
