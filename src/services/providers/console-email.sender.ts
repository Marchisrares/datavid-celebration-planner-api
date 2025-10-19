import { EmailSender } from './email-sender.interface';

export class ConsoleEmailSender implements EmailSender {
  async send(msg: any, opts = { dryRun: true }) {
    console.log(
      `[EMAIL ${opts.dryRun ? 'DRY-RUN' : 'SEND'}] To: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.body}`
    );
    return { dryRun: !!opts.dryRun, provider: 'ConsoleEmailSender' };
  }
}
