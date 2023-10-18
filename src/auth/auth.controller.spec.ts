import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, PrismaService, JwtService, UsersService], // Include your dependencies here
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ token: 'test_token' });

      await authController.login(responseMock as Response, loginUserDto);

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'User logged in successfully',
        data: { token: 'test_token' },
      });
    });

    it('should handle login errors', async () => {
      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'incorrect_password',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Invalid password'));

      await authController.login(responseMock as Response, loginUserDto);

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: 'Invalid password',
      });
    });

    // Adicione mais testes conforme necessário
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const registerUserDto: RegisterUserDto = {
        email: 'new@example.com',
        password: 'password',
        confirmPassword: 'password',
        name: 'New User',
      };

      jest
        .spyOn(authService, 'register')
        .mockResolvedValue({ token: 'test_token' });

      await authController.register(responseMock as Response, registerUserDto);

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        data: { token: 'test_token' },
      });
    });

    it('should handle registration errors', async () => {
      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const registerUserDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        name: 'Test User',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new Error('Email already in use'));

      await authController.register(responseMock as Response, registerUserDto);

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: 'Email already in use',
      });
    });

    // Adicione mais testes conforme necessário
  });

  describe('updateUser', () => {
    it('should update a user successfully when authorized', async () => {
      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        password: 'new-password',
        confirmPassword: 'new-password',
        name: 'New Name',
        isAdmin: true,
      };
      const userId = '1';
      const user = {
        id: 1,
        email: 'old-email@example.com',
        password: 'hashed-password',
        name: 'Old Name',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(authService, 'updateUser').mockResolvedValue(user);

      await authController.updateUser(
        { user: { isAdmin: true } } as Request,
        responseMock as Response,
        updateUserDto,
        userId,
      );

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
        data: user,
      });
    });

    it('should handle unauthorized user update', async () => {
      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        password: 'new-password',
        confirmPassword: 'new-password',
        name: 'New Name',
        isAdmin: true,
      };
      const userId = '1';

      jest
        .spyOn(authService, 'updateUser')
        .mockRejectedValue(new Error('You are not authorized'));

      await authController.updateUser(
        { user: { isAdmin: false } } as Request,
        responseMock as Response,
        updateUserDto,
        userId,
      );

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'You are not authorized to update user',
      });
    });

    // Adicione mais testes conforme necessário
  });
});
