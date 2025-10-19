import { EmailSender } from './email-sender.interface';
import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export class SmtpEmailSender implements EmailSender {
  async send(msg: any, opts = { dryRun: true }) {
    if (opts.dryRun) return { dryRun: true, provider: 'SmtpEmailSender' };
    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: false,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });
    await transporter.sendMail({
      from: env.smtp.from,
      to: msg.to,
      subject: msg.subject,
      text: msg.body
    });
    return { dryRun: false, provider: 'SmtpEmailSender' };
  }
}
