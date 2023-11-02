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

    // Compare the entered password with the hashed password in the database
    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      console.log('Invalid password');
      throw new Error('Invalid password');
    }

    return {
      user,
      token: this.jwtService.sign({ email }),
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<any> {
    const { email, password, name, confirmPassword } = registerUserDto;

    // Check if the passwords match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if a user with the same email already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      // Return a token and the newly created user
      return {
        token: this.jwtService.sign({ email }),
        user: newUser,
      };
    } catch (error) {
      throw new Error('Error creating user');
    }
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

  async getUserByToken(token: string): Promise<any> {
    const { email } = this.jwtService.verify(token);
    return await this.prismaService.user.findUnique({
      where: { email },
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
    if (!hashPassword) throw new Error('Error hashing password');

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
