import { PrismaService } from './../database/prisma.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @Get('statistics')
  async statistics() {
    const totalUsers = await this.prismaService.user.count();
    const totalPosts = await this.prismaService.post.count();
    const totalComments = await this.prismaService.comments.count();

    return {
      uptime: process.uptime(),
      totalUsers,
      totalPosts,
      totalComments,
    };
  }
}
