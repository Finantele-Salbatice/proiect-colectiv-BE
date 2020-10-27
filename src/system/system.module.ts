import { Module } from '@nestjs/common';
import { Database } from './database';

@Module({
  providers: [Database],
  exports: [Database]
})
export class SystemModule {}
