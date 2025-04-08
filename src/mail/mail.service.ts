import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmailConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Awesome App! Confirm your email',
      template: './emailConfirmation',
      context: {
        name: user.name,
        url,
      },
    });
  }

  public async sendPasswordReset(user: User, token: string) {
    const url = `example.com/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      template: './forgotPassword',
      context: {
        name: user.name,
        resetLink: url,
      },
    });
  }
}
