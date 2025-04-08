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
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

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
  @HttpCode(HttpStatus.OK)
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

  @Post('resendVerificationEmail')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body() resendVerificationEmailDto: ResendVerificationEmailDto,
  ) {
    // 200 OK: Generic success response.
    // 400 Bad Request: If the provided email format is invalid.
    // 429 Too Many Requests: If the user is requesting verification emails too frequently (to prevent spamming).
    // 500 Internal Server Error: For unexpected server errors.
    return this.authService.resendVerificationEmail(resendVerificationEmailDto);
  }

  @Post('verifyEmail')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    // Success - 200 OK
    // { "message": "Password reset email sent." }
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    // Success - 200 OK
    // { "message": "Password successfully reset." }
    //
    // Invalid or Expired Reset Token - 401 Unauthorized
    return this.authService.resetPassword(resetPasswordDto);
  }
}
