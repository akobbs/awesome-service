import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginResponse,
  RefreshTokenResponse,
  RegisterResponse,
  UserProfileResponse,
} from './types';
import { RequestWithUser } from '../common/types';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './jwt.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: LoginDto): Promise<LoginResponse> {
    // Success - 200 OK
    // { "accessToken": "..." }
    //
    // Invalid Credentials - 401 Unauthorized
    // { "error": "Invalid email or password." }
    //
    // Account Not Verified - 403 Forbidden (if you have an email verification step)
    // { "error": "Account not verified." }
    return this.authService.login(loginData);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signUp')
  async signUp(@Body() registerData: SignUpDto): Promise<RegisterResponse> {
    // Success - 201 Created
    // { "message": "User account successfully created." }
    //
    // User Already Exists - 409 Conflict
    //
    // Validation Error - 400 Bad Request
    // { "error": "Password must be at least 8 characters long." }
    return this.authService.signUp(registerData);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req: RequestWithUser): Promise<UserProfileResponse> {
    return Promise.resolve(req.user);
  }

  @Post('refreshToken')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    // Success - 200 OK
    // { "accessToken": "..." }
    //
    // Invalid or Expired Refresh Token - 401 Unauthorized
    // { "error": "Invalid refresh token." }
    //
    // Refresh Token Blacklisted - 403 Forbidden
    // { "error": "Refresh token is not longer valid." }
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgotPassword')
  async forgotPassword() {
    // Success - 200 OK
    // { "message": "Password reset email sent." }
    throw new Error('Not implemented');
  }

  @Post('resetPassword')
  async resetPassword() {
    // Success - 200 OK
    // { "message": "Password successfully reset." }
    //
    // Invalid or Expired Reset Token - 401 Unauthorized
    throw new Error('Not implemented');
  }
}
