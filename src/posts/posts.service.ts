import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../database/prisma.service';
import { Request, Response } from 'express';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    req: Request,
    id: number,
    response: Response,
  ) {
    const validNewPost = () => {
      if (!createPostDto.title) {
        return 'Title is required';
      }
      if (!createPostDto.subtitle) {
        return 'Subtitle is required';
      }
      if (!createPostDto.content) {
        return 'Content is required';
      }

      if (createPostDto.title.length < 3) {
        return 'Title must be at least 3 characters';
      }
      if (createPostDto.subtitle.length < 3) {
        return 'Subtitle must be at least 3 characters';
      }

      return true;
    };

    try {
      if (validNewPost() != true) {
        response.status(400).json({ error: validNewPost() });
        return;
      }
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
      response.status(400).json({ error: error.message });
    }
  }

  async findAllByUser(page: number, limit: number, id: number) {
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 1;
    }
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

  async findAllWithPagination(
    page: number,
    limit: number,
    orderByProp?: string,
    order?: string,
  ) {
    // const posts = await this.prisma.post.findMany({
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: {
    //     createdAt: 'asc',
    //   },
    // });

    //pegue também o nome do autor e o total de comentários
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 1;
    }
    const posts = await this.prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderByProp]: order,
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
        _count: {
          select: { comments: true },
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
      totalComments: res._count.comments,
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

  async remove(id: number) {
    try {
      const verifyPost = await this.prisma.post.findUnique({
        where: { id },
      });
      console.log(verifyPost);
      if (!verifyPost) {
        throw new Error('Post not found');
      }
      return this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      return error.message;
    }
  }
}
