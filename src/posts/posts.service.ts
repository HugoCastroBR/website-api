import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../database/prisma.service';
import { Request, Response } from 'express';

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

  async findAllWithPagination(page: number, limit: number) {
    const posts = await this.prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });

    const total = await this.prisma.post.count();
    const totalPages = Math.ceil(total / limit);
    const data = posts;
    return { data, total, page, limit, totalPages };
  }

  async findAll() {
    return await this.prisma.post.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.post.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  remove(id: number) {
    try {
      this.prisma.post.delete({
        where: { id },
      });
      return 'Post deleted successfully';
    } catch (error) {
      return error.message;
    }
  }
}
