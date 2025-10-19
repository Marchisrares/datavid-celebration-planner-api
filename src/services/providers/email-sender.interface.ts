import { EmailMessage } from '../../models/ai.model';

export interface EmailSender {
  send(msg: EmailMessage, opts?: { dryRun?: boolean }): Promise<{ dryRun: boolean; provider: string }>;
}
