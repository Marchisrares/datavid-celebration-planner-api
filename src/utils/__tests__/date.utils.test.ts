import { DateUtils } from '../date.utils';
import { DateTime } from 'luxon';

describe('DateUtils', () => {
  describe('isAdult', () => {
    it('should return true for someone who is exactly 18 years old', () => {
      const eighteenYearsAgo = DateTime.now().minus({ years: 18 }).toISODate();
      expect(DateUtils.isAdult(eighteenYearsAgo!, 'UTC')).toBe(true);
    });

    it('should return true for someone who is 25 years old', () => {
      const result = DateUtils.isAdult('1999-01-15', 'UTC');
      expect(result).toBe(true);
    });

    it('should return false for someone who is 17 years old', () => {
      const seventeenYearsAgo = DateTime.now().minus({ years: 17 }).toISODate();
      expect(DateUtils.isAdult(seventeenYearsAgo!, 'UTC')).toBe(false);
    });

    it('should return false for someone who is 10 years old', () => {
      const result = DateUtils.isAdult('2010-01-01', 'UTC');
      expect(result).toBe(false);
    });

    it('should handle timezone differences correctly', () => {
      // Someone born 18 years ago in New York timezone
      const birthDate = DateTime.now()
        .setZone('America/New_York')
        .minus({ years: 18 })
        .toISODate();

      expect(DateUtils.isAdult(birthDate!, 'America/New_York')).toBe(true);
    });

    it('should handle leap year birthdays', () => {
      // Born on Feb 29, 2004 (leap year) - would be 20+ years old now
      const result = DateUtils.isAdult('2004-02-29', 'UTC');
      expect(result).toBe(true);
    });
  });

  describe('computeNextBirthday', () => {
    it('should calculate next birthday for someone born in January', () => {
      const result = DateUtils.computeNextBirthday('1990-01-15', 'UTC');

      expect(result).toHaveProperty('nextDate');
      expect(result).toHaveProperty('daysUntil');
      expect(result).toHaveProperty('turnsAge');
      expect(typeof result.daysUntil).toBe('number');
      expect(result.daysUntil).toBeGreaterThanOrEqual(0);
      expect(result.daysUntil).toBeLessThan(366);
    });

    it('should calculate correct age they will turn', () => {
      const result = DateUtils.computeNextBirthday('1990-10-25', 'UTC');
      const expectedAge = DateTime.now().year - 1990;

      // They either turn expectedAge or expectedAge + 1 depending on if birthday has passed
      expect([expectedAge, expectedAge + 1]).toContain(result.turnsAge);
    });

    it('should return 0 days until if birthday is today', () => {
      const today = DateTime.now().setZone('UTC');
      const birthDateThisYear = today.toISODate();

      const result = DateUtils.computeNextBirthday(birthDateThisYear!, 'UTC');
      expect(result.daysUntil).toBe(0);
    });

    it('should handle year rollover (birthday in next year)', () => {
      // If today is Dec 31 and birthday is Jan 1, should handle correctly
      const result = DateUtils.computeNextBirthday('1990-01-01', 'UTC');

      expect(result.daysUntil).toBeGreaterThanOrEqual(0);
      expect(result.nextDate).toBeTruthy();
    });

    it('should calculate correctly for different timezones', () => {
      const result = DateUtils.computeNextBirthday('1990-10-25', 'Europe/Bucharest');

      expect(result).toHaveProperty('nextDate');
      expect(result.daysUntil).toBeGreaterThanOrEqual(0);
      expect(result.turnsAge).toBeGreaterThan(0);
    });

    it('should handle February 29 birthdays on non-leap years', () => {
      const result = DateUtils.computeNextBirthday('2000-02-29', 'UTC');

      expect(result).toHaveProperty('nextDate');
      expect(result.daysUntil).toBeGreaterThanOrEqual(0);
      expect(result.turnsAge).toBeGreaterThan(0);
    });
  });

  describe('isBirthdayToday', () => {
    it('should return true if birthday is today', () => {
      const today = new Date();
      const result = DateUtils.isBirthdayToday(today, 'UTC');

      expect(result).toBe(true);
    });

    it('should return false if birthday is tomorrow', () => {
      const tomorrow = DateTime.now().plus({ days: 1 }).toJSDate();
      const result = DateUtils.isBirthdayToday(tomorrow, 'UTC');

      expect(result).toBe(false);
    });

    it('should return false if birthday is yesterday', () => {
      const yesterday = DateTime.now().minus({ days: 1 }).toJSDate();
      const result = DateUtils.isBirthdayToday(yesterday, 'UTC');

      expect(result).toBe(false);
    });

    it('should match month and day regardless of year', () => {
      // Today's date but from 1990
      const today = DateTime.now().setZone('UTC');
      const birthDate = today.set({ year: 1990 }).toJSDate();

      const result = DateUtils.isBirthdayToday(birthDate, 'UTC');
      expect(result).toBe(true);
    });

    it('should handle timezone differences', () => {
      const today = DateTime.now().setZone('America/New_York').toJSDate();
      const result = DateUtils.isBirthdayToday(today, 'America/New_York');

      expect(result).toBe(true);
    });
  });
});
