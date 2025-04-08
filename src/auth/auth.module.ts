import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './entities/refreshToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { Token } from './entities/token.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken, Token]),
    ConfigModule,
    MailModule,
    JwtModule.register({
      global: true,
      // TODO: provide secret key from config
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [AuthService, TokenService, PasswordService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
