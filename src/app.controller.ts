import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Authentication } from '@nestjs-cognito/auth';

@Controller()
@Authentication()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  getHello(): string {
    return this.appService.getHello();
  }
}
