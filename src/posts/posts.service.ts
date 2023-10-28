import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../database/prisma.service';
import { Request } from 'express';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, req: Request, id: number) {
    try {
      const createdPost = await this.prisma.post.create({
        data: {
          ...createPostDto,
          author: {
            connect: {
              id,
            },
          },
        },
      });
      return createdPost;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllByUser(page: number, limit: number, id: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: id,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });
    const total = await this.prisma.post.count({
      where: {
        authorId: id,
      },
    });
    const authorName = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
      },
    });

    const totalComments = await this.prisma.comments.count({
      where: {
        authorId: id,
      },
    });

    const totalPages = Math.ceil(total / limit);
    const data = posts.map((post) => {
      return {
        ...post,
        authorName: authorName.name,
        totalComments,
      };
    });
    return { data, total, page, limit, totalPages };
  }

  async findAllWithPagination(page: number, limit: number) {
    // const posts = await this.prisma.post.findMany({
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: {
    //     createdAt: 'asc',
    //   },
    // });

    //pegue também o nome do autor e o total de comentários

    const posts = await this.prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        _count: {
          select: { comments: true },
        },
        author: {
          select: { name: true },
        },
      },
    });

    const total = await this.prisma.post.count();
    const totalPages = Math.ceil(total / limit);
    const data = posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        subtitle: post.subtitle,
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorName: post.author.name,
        totalComments: post._count.comments,
      };
    });

    // remove _count e author do objeto

    return { data, total, page, limit, totalPages };
  }

  async findAll() {
    return await this.prisma.post.findMany();
  }

  async findOne(id: number) {
    const res = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const data = {
      id: res.id,
      title: res.title,
      authorId: res.authorId,
      content: res.content,
      imageUrl: res.imageUrl,
      subtitle: res.subtitle,
      published: res.published,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      authorName: res.author.name,
      totalComments: res.comments.length,
      comments: res.comments.map((comment) => {
        return {
          id: comment.id,
          content: comment.content,
          authorId: comment.authorId,
          postId: comment.postId,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          authorName: comment.author.name,
        };
      }),
    };

    return data;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    try {
      return this.prisma.post.update({
        where: { id },
        data: updatePostDto,
      });
    } catch (error) {
      return error.message;
    }
  }

  remove(id: number) {
    try {
      return this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      return error.message;
    }
  }
}
