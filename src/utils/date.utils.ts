import { DateTime } from 'luxon';

export class DateUtils {
  static isAdult(birthDateISO: string, tz = 'UTC'): boolean {
    const today = DateTime.now().setZone(tz).startOf('day');
    const birth = DateTime.fromISO(birthDateISO, { zone: tz });
    let age = today.year - birth.year;
    if (today < birth.set({ year: today.year })) age -= 1;
    return age >= 18;
  }

  static computeNextBirthday(birthDateISO: string, tz: string) {
    const today = DateTime.now().setZone(tz).startOf('day');
    const birth = DateTime.fromISO(birthDateISO, { zone: tz });
    let candidate = birth.set({ year: today.year });
    if (candidate < today) candidate = candidate.plus({ years: 1 });
    const daysUntil = Math.round(candidate.diff(today, 'days').days);
    const turnsAge = candidate.year - birth.year;
    return { nextDate: candidate.toISODate()!, daysUntil, turnsAge };
  }

  static isBirthdayToday(birthDate: Date, tz: string): boolean {
    const today = DateTime.now().setZone(tz);
    const birth = DateTime.fromJSDate(birthDate).setZone(tz);
    return today.month === birth.month && today.day === birth.day;
  }
}
