import { memberRepository } from '../repositories/member.repository';
import { UpcomingBirthday, TodayBirthday } from '../models/birthday.model';
import { DateUtils } from '../utils/date.utils';

export class BirthdayService {
  async getUpcomingBirthdays(days: number = 30): Promise<UpcomingBirthday[]> {
    const members = await memberRepository.findAll();

    const upcomingBirthdays = members
      .map(member => {
        const birthDateISO = member.birthDate.toISOString().slice(0, 10);
        const { nextDate, daysUntil, turnsAge } = DateUtils.computeNextBirthday(birthDateISO, member.tz);

        return {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          birthDate: birthDateISO,
          nextBirthdayDate: nextDate,
          turnsAge,
          daysUntil,
          tz: member.tz
        };
      })
      .filter(birthday => birthday.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return upcomingBirthdays;
  }

  async getTodayBirthdays(): Promise<TodayBirthday[]> {
    const members = await memberRepository.findAll();

    const todayBirthdays = members
      .filter(member => DateUtils.isBirthdayToday(member.birthDate, member.tz))
      .map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        birthDate: member.birthDate.toISOString().slice(0, 10),
        tz: member.tz
      }));

    return todayBirthdays;
  }
}

export const birthdayService = new BirthdayService();
