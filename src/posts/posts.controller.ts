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
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const userId = req.user['id'];
      const result = await this.postsService.create(
        createPostDto,
        req,
        userId,
        response,
      );
      return response.status(201).json({
        message: 'Post created successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @Get()
  async findAllWithPagination(
    @Query() pagination: PaginationDTO,
    @Res() response?: Response,
  ) {
    try {
      const res = await this.postsService.findAllWithPagination(
        Number(pagination.page),
        Number(pagination.itemsPerPage),
        pagination.orderBy,
        pagination.order,
      );
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/user/:id')
  async findAllByUser(
    @Param('id') id: number,
    @Query() pagination: PaginationDTO,
    @Req() req: Request,
    @Res() response?: Response,
  ) {
    try {
      const res = await this.postsService.findAllByUser(
        Number(pagination.page),
        Number(pagination.itemsPerPage),
        Number(id),
      );
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() response?: Response) {
    try {
      const res = await this.postsService.findOne(+id);
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Res() response?: Response,
  ) {
    try {
      const res = await this.postsService.update(+id, updatePostDto);
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() response?: Response) {
    try {
      const res = await this.postsService.remove(+id);
      if (res === 'Post not found') {
        response?.status(404).json({ error: res });
        return;
      }
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }
}
