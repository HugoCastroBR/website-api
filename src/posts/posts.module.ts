import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [PrismaModule],
})
export class PostsModule {}
