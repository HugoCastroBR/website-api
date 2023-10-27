import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      throw new Error('Invalid password');
    }

    return {
      user,
      token: this.jwtService.sign({ email }),
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<any> {
    const { email, password, name, confirmPassword } = registerUserDto;

    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    if (!hashPassword) {
      throw new Error('Error hashing password');
    }

    const existing = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('Email already in use');
    }

    await this.usersService.create({
      email,
      password: hashPassword,
      name,
    });

    const userCreated = await this.prismaService.user.findUnique({
      where: { email },
    });

    return {
      token: this.jwtService.sign({ email }),
      user: userCreated,
    };
  }

  async updatePassword(email: string, password: string): Promise<any> {
    const hashPassword = await bcrypt.hash(password, 10);

    if (!hashPassword) {
      throw new Error('Error hashing password');
    }

    return await this.prismaService.user.update({
      where: { email },
      data: { password: hashPassword },
    });
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
    res: Response,
  ): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(400).json({ error: 'User not found' });
    }

    const { email, password, confirmPassword, name, isAdmin } = updateUserDto;

    const hashPassword = !!password && (await bcrypt.hash(password, 10));

    if (!hashPassword && password === confirmPassword) {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...user,
          email,
          name,
          isAdmin,
        },
      });
    } else if (password === confirmPassword) {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...user,
          email,
          password: hashPassword,
          name,
          isAdmin,
        },
      });
    } else {
      if (!!!confirmPassword) throw new Error('Confirm password is required');
      if (!!!password) throw new Error('Password is required');
      if (confirmPassword !== password)
        throw new Error('Passwords does not match');
    }
  }
}
