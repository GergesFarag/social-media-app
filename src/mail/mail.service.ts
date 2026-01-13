import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }
  async sendEmail(email: string, link: string) {
    return this.transporter.sendMail({
      date: new Date().toISOString(),
      to: email,
      subject: 'Verify your email',
      html: `<h3>Welcome</h3> 
      <p>Click the link below to verify your email:</p>
      <a href=${link} target='_blank'>Verify Email</a>
      `,
    });
  }
}
