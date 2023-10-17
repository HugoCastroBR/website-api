import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
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

    return {
      token: this.jwtService.sign({ email }),
    };
  }
}
