import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PaginationDTO } from '../dtos/pagination';

@ApiTags('posts')
@Controller('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const userId = req.user['id'];
      const result = await this.postsService.create(createPostDto, req, userId);
      return response.status(200).json({
        message: 'Post created successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @Get()
  findAllWithPagination(@Query() pagination: PaginationDTO) {
    return this.postsService.findAllWithPagination(
      Number(pagination.page),
      Number(pagination.itemsPerPage),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postsService.remove(+id);
  }
}
