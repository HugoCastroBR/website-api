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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PaginationDTO } from '../dtos/pagination';

@ApiTags('comments')
@Controller('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const userId = req.user['id'];
      const result = await this.commentsService.create(
        createCommentDto,
        userId,
      );
      return response.status(201).json({
        message: 'Comment created successfully',
        data: result,
        status: 201,
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
      const res = await this.commentsService.findAllWithPagination(
        Number(pagination.page),
        Number(pagination.itemsPerPage),
      );
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.commentsService.remove(+id);
  }
}
