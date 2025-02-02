import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CompanySchema } from './entities/company.entity';
import { AccessSchema } from './entities/access.entity';
import { UserSchema } from './entities/user.entity';
import { UserCreateCommand } from './commands/user/user-create.command';
import { UserService } from './services/user.service';
import { AccessAddCommand } from './commands/user/access-add.command';
import { CompanyService } from './services/company.service';
import { AccessService } from './services/access.service';
import { CompanyCreateCommand } from './commands/user/company-create.command';
import { CognitoAuthModule } from '@nestjs-cognito/auth';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { UserController } from './controllers/user.controller';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { CompanyController } from './controllers/company.controller';
import { MasterEncryptionService } from './services/master-encryption.service';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: 'Company', schema: CompanySchema },
      { name: 'Access', schema: AccessSchema },
      { name: 'User', schema: UserSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CognitoAuthModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        jwtVerifier: {
          region: configService.get('COGNITO_REGION'),
          userPoolId: configService.get('COGNITO_USER_POOL_ID'),
          clientId: configService.get('COGNITO_CLIENT_ID'),
          tokenUse: 'id',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, UserController, CompanyController],
  providers: [
    AppService,
    UserService,
    CompanyService,
    MasterEncryptionService,
    AccessService,
    UserCreateCommand,
    AccessAddCommand,
    CompanyCreateCommand,

    {
      provide: 'COGNITO_CLIENT',
      useFactory: async (configService: ConfigService) => {
        return new CognitoIdentityProviderClient({
          region: configService.get('COGNITO_REGION'),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    UserService,
    CompanyService,
    MasterEncryptionService,
    AccessService,
    'COGNITO_CLIENT',
  ],
})
export class AppModule {}
