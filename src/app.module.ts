import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CompanySchema } from './entities/company.entity';
import { AccessSchema } from './entities/access.entity';
import { UserSchema } from './entities/user.entity';
import { UserCreateCommand } from './commands/user/user-create.command';
import { UserService } from './services/user.service';
import { AccessAddCommand } from './commands/user/access-add.command';
import { CompanyService } from './services/company.service';
import { AccessService } from './services/access.service';
import { CompanyCreateCommand } from './commands/user/company-create.command';

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
  providers: [
    AppService,
    UserService,
    CompanyService,
    AccessService,
    UserCreateCommand,
    AccessAddCommand,
    CompanyCreateCommand,
  ],
  exports: [UserService, CompanyService, AccessService],
})
export class AppModule {}
