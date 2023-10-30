import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  Body,
  Delete,
  Patch,
  Req,
  Res,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PaginationDTO } from '../dtos/pagination';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const result = await this.usersService.create(createUserDto);
      return response.status(201).json({
        message: 'User created successfully',
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
      const res = await this.usersService.findAllWithPagination(
        Number(pagination.page),
        Number(pagination.itemsPerPage),
        pagination.orderBy,
        pagination.order,
      );
      response?.status(200).json(res);
    } catch (error) {
      if (error.message === 'Page not found') {
        response?.status(404).json({ error: error.message });
      } else {
        response?.status(400).json({ error: error.message });
      }
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() response?: Response) {
    try {
      const user = await this.usersService.findOne(+id);
      response?.status(200).json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        response?.status(404).json({ error: error.message });
      } else {
        response?.status(400).json({ error: error.message });
      }
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Res() response?: Response,
  ) {
    try {
      const res = await this.usersService.update(+id, updateUserDto);
      response?.status(200).json(res);
    } catch (error) {
      if (error.message === 'User not found') {
        response?.status(404).json({ error: error.message });
      } else {
        response?.status(400).json({ error: error.message });
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Res() response?: Response) {
    try {
      const res = await this.usersService.remove(+id);
      response?.status(200).json(res);
    } catch (error) {
      if (error.message === 'User not found') {
        response?.status(404).json({ error: error.message });
      } else {
        response?.status(400).json({ error: error.message });
      }
    }
  }
}
