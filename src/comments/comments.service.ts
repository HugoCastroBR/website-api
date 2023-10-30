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
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.prisma.comments.count();
    const totalPages = Math.ceil(total / limit);
    const data = comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        authorName: comment.author.name,
        postId: comment.postId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        authorId: comment.authorId,
      };
    });
    return { data, total, page, limit, totalPages };
  }

  async findAllWithPaginationByPostId(
    page: number,
    limit: number,
    postId: number,
    orderByProp?: string,
    order?: string,
  ) {
    const comments = await this.prisma.comments.findMany({
      where: { postId }, // Filtro fixo
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderByProp]: order,
      },
    });
    const total = await this.prisma.comments.count({ where: { postId } }); // Filtro fixo para contar

    const totalPages = Math.ceil(total / limit);
    const data = comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        authorName: comment.author.name,
        postId: comment.postId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        authorId: comment.authorId,
      };
    });
    return { data, total, page, limit, totalPages };
  }

  async findAllWithPaginationByUserId(
    page: number,
    limit: number,
    userId: number,
    orderByProp?: string,
    order?: string,
  ) {
    const comments = await this.prisma.comments.findMany({
      where: { authorId: userId }, // Filtro fixo
      include: {
        post: {},
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderByProp]: order,
      },
    });

    const total = await this.prisma.comments.count({
      where: { authorId: userId },
    });

    const totalPages = Math.ceil(total / limit);
    const data = comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        authorName: comment.author.name,
        postId: comment.postId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        authorId: comment.authorId,
        postTitle: comment.post.title,
      };
    });

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

  async remove(id: number) {
    try {
      await this.prisma.comments.delete({
        where: { id },
      });
      return 'Comment deleted successfully';
    } catch (error) {
      return error.message;
    }
  }
}
