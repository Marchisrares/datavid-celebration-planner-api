import { AiMessageRequest, AiMessageResponse } from '../models/ai.model';
import { memberRepository } from '../repositories/member.repository';
import { birthdayService } from './birthday.service';
import { NotFoundError } from '../common/errors';
import { ErrorCodes, MemberErrorMessages } from '../enums';
import { AiProvider } from './providers/ai-provider.interface';
import { EmailSender } from './providers/email-sender.interface';

const LOCALE_MAP: Record<string, string> = {
  Romania: 'ro',
  Italy: 'it',
  Germany: 'de',
  France: 'fr',
  USA: 'en',
  'United Kingdom': 'en',
  India: 'en',
  China: 'en'
};

export class AiService {
  constructor(
    private aiProvider: AiProvider,
    private emailSender: EmailSender
  ) {}

  async generateBirthdayMessage(request: AiMessageRequest): Promise<AiMessageResponse> {
    const member = await memberRepository.findById(request.memberId);
    if (!member) {
      throw new NotFoundError(
        MemberErrorMessages.MEMBER_NOT_FOUND_WITH_ID.replace('{id}', request.memberId.toString()),
        ErrorCodes.MEMBER_NOT_FOUND
      );
    }

    const upcomingBirthdays = await birthdayService.getUpcomingBirthdays(365);
    const memberBirthday = upcomingBirthdays.find(b => b.id === member.id);
    const ageTurning = memberBirthday
      ? memberBirthday.turnsAge
      : new Date().getFullYear() - new Date(member.birthDate).getFullYear();

    const locale = request.locale || LOCALE_MAP[member.country] || 'en';

    const aiResult = await this.aiProvider.generate({
      firstName: member.firstName,
      city: member.city,
      country: member.country,
      ageTurning,
      tone: request.tone,
      locale
    });

    const response: AiMessageResponse = {
      message: aiResult.message,
      explanation: aiResult.explanation
    };

    if (request.sendEmail) {
      const dryRun = request.dryRunEmail ?? true;
      const emailResult = await this.emailSender.send(
        {
          to: member.email,
          subject: `Happy Birthday, ${member.firstName}!`,
          body: aiResult.message
        },
        { dryRun }
      );
      response.sent = emailResult;
    }

    return response;
  }
}
