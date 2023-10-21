import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { RefreshToken } from './refreshToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken]),
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [AuthService, TokenService, PasswordService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
