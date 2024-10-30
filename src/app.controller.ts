import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource
  ) {}

  @Get()
  async getHello(): Promise<string> {
    if (this.dataSource.isInitialized) {
      return 'Connected to PostgreSQL'
    } else {
      return 'Failed to connect to PostgreSQL'
    }
  }
}
