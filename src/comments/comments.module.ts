import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [PrismaModule],
})
export class CommentsModule {}
