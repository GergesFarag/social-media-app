import { Module } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { CloudinaryProvider } from './providers/cloud.provider';
import { CloudController } from './cloud.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CloudService, CloudinaryProvider],
  exports: [CloudService, CloudinaryProvider],
  controllers: [CloudController],
})
export class CloudModule {}
