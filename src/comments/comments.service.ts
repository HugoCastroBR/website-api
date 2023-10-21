import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}
  async create(createCommentDto: CreateCommentDto, userId: number) {
    try {
      const { content, postId } = createCommentDto;

      const req = await this.prisma.comments.create({
        data: {
          content,
          author: {
            connect: {
              id: userId,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });

      return req;
    } catch (error) {
      console.log(error);
      throw error; // Optionally, you can rethrow the error to handle it elsewhere
    }
  }

  async findAllWithPagination(page: number, limit: number) {
    const comments = await this.prisma.comments.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });
    const total = await this.prisma.comments.count();
    const totalPages = Math.ceil(total / limit);
    const data = comments;
    return { data, total, page, limit, totalPages };
  }

  findOne(id: number) {
    return this.prisma.comments.findUnique({
      where: { id },
    });
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    const { content } = updateCommentDto;
    return this.prisma.comments.update({
      where: { id },
      data: { content },
    });
  }

  remove(id: number) {
    try {
      this.prisma.comments.delete({
        where: { id },
      });
      return 'Comment deleted successfully';
    } catch (error) {
      return error.message;
    }
  }
}
