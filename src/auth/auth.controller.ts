import { Post, Controller, Req, Res, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Res() response: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<any> {
    try {
      const result = await this.authService.login(loginUserDto);
      return response.status(200).json({
        message: 'User logged in successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @Post('Register')
  async register(
    @Res() response: Response,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<any> {
    try {
      const result = await this.authService.register(registerUserDto);
      return response.status(200).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
}
