import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

let authService: AuthService;
let prismaService: PrismaService;
let usersService: UsersService;
let jwtService: JwtService;
let prismaUser;
describe('AuthService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, UsersService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    prismaUser = await prismaService.user;
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password', 10),
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaUser, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test_token');

      const result = await authService.login(loginUserDto);

      expect(result).toEqual({ token: 'test_token' });
    });

    it('should throw an error when the user is not found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };

      jest.spyOn(prismaUser, 'findUnique').mockResolvedValue(null);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw an error on invalid password', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'incorrect_password',
      };

      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password', 10),
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaUser, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        'Invalid password',
      );
    });
  });

  describe('AuthService', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });

    describe('register', () => {
      it('should return a token on successful registration', async () => {
        const registerUserDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
          name: 'Test User',
        };

        jest.spyOn(prismaUser, 'findUnique').mockResolvedValue(null);
        jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue('hashed_password' as never);
        jest
          .spyOn(usersService, 'create')
          .mockResolvedValue({ email: 'test@example.com' } as never);
        jest.spyOn(jwtService, 'sign').mockReturnValue('test_token' as never);

        const result = await authService.register(registerUserDto);

        expect(result).toEqual({ token: 'test_token' });
      });

      it('should throw an error when password does not match', async () => {
        const registerUserDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'different_password',
          name: 'Test User',
        };

        await expect(authService.register(registerUserDto)).rejects.toThrow(
          'Password not match',
        );
      });

      it('should throw an error when email is already in use', async () => {
        const registerUserDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
          name: 'Test User',
        };

        jest.spyOn(prismaUser, 'findUnique').mockResolvedValue({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password',
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never);

        await expect(authService.register(registerUserDto)).rejects.toThrow(
          'Email already in use',
        );
      });

      it('should throw an error when bcrypt.hash fails', async () => {
        const registerUserDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
          name: 'Test User',
        };

        jest.spyOn(prismaUser, 'findUnique').mockResolvedValue(null);
        jest
          .spyOn(bcrypt, 'hash')
          .mockRejectedValue(Error('Hashing error') as never);

        await expect(authService.register(registerUserDto)).rejects.toThrow(
          'Hashing error',
        );
      });

      // Adicione mais casos de teste conforme necessário
    });
  });

  describe('updatePassword', () => {
    it('should update the password successfully', async () => {
      const email = 'test@example.com';
      const newPassword = 'new_password';
      const hashedPassword = 'hashed_password';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jest.spyOn(prismaUser, 'update').mockResolvedValue({} as never);

      const result = await authService.updatePassword(email, newPassword);

      expect(result).toEqual({});
    });

    it('should throw an error when bcrypt.hash fails', async () => {
      const email = 'test@example.com';
      const newPassword = 'new_password';

      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValue(new Error('Hashing error') as never);

      await expect(
        authService.updatePassword(email, newPassword),
      ).rejects.toThrow('Hashing error');
    });
  });
  describe('updateUser', () => {
    it('should update the user when valid data is provided', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        password: 'new-password',
        confirmPassword: 'new-password',
        name: 'New Name',
        isAdmin: true,
      };

      const user = {
        id: userId,
        email: 'old-email@example.com',
        password: 'hashed-password',
        name: 'Old Name',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...user,
        email: updateUserDto.email,
        name: updateUserDto.name,
        isAdmin: updateUserDto.isAdmin,
        password: 'new-hashed-password',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('new-hashed-password' as never);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const result = await authService.updateUser(
        userId,
        updateUserDto,
        responseMock as Response,
      );

      expect(result).toEqual(updatedUser);
    });

    it('should return an error when the user is not found', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        password: 'new-password',
        confirmPassword: 'new-password',
        name: 'New Name',
        isAdmin: true,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authService.updateUser(
        userId,
        updateUserDto,
        responseMock as Response,
      );

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    it('should throw an error when password and confirmPassword do not match', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        password: 'new-password',
        confirmPassword: 'different-password',
        name: 'New Name',
        isAdmin: true,
      };

      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await expect(
        authService.updateUser(userId, updateUserDto, responseMock as Response),
      ).rejects.toThrow('Passwords does not match');
      expect(responseMock.status).not.toHaveBeenCalled();
    });

    // Adicione mais casos de teste conforme necessário
  });
});
