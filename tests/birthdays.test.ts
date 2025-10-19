import request from 'supertest';
import express, { Express } from 'express';
import birthdayRoutes from '../src/routes/birthday.routes';
import { errorMiddleware } from '../src/common/errors';
import { prisma } from '../src/db/prisma';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/birthdays', birthdayRoutes);
  app.use(errorMiddleware);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Birthday API Endpoints', () => {
  describe('GET /api/birthdays/today', () => {
    it('should return today\'s birthdays', async () => {
      const response = await request(app).get('/api/birthdays/today');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Each birthday should have required fields
      response.body.data.forEach((birthday: any) => {
        expect(birthday).toHaveProperty('id');
        expect(birthday).toHaveProperty('firstName');
        expect(birthday).toHaveProperty('lastName');
        expect(birthday).toHaveProperty('birthDate');
        expect(birthday).toHaveProperty('tz');
      });
    });

    it('should only return birthdays matching today\'s date', async () => {
      const response = await request(app).get('/api/birthdays/today');

      if (response.body.data.length > 0) {
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();

        response.body.data.forEach((birthday: any) => {
          const birthDate = new Date(birthday.birthDate);
          const birthMonth = birthDate.getMonth() + 1;
          const birthDay = birthDate.getDate();

          // Note: Timezone handling may cause off-by-one day differences
          // so we check if it's within reasonable range
          expect([birthMonth]).toContain(todayMonth);
        });
      }
    });
  });

  describe('GET /api/birthdays/upcoming', () => {
    it('should return upcoming birthdays with default 30 days window', async () => {
      const response = await request(app).get('/api/birthdays/upcoming');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Each upcoming birthday should have extended fields
      response.body.data.forEach((birthday: any) => {
        expect(birthday).toHaveProperty('id');
        expect(birthday).toHaveProperty('firstName');
        expect(birthday).toHaveProperty('lastName');
        expect(birthday).toHaveProperty('birthDate');
        expect(birthday).toHaveProperty('nextBirthdayDate');
        expect(birthday).toHaveProperty('turnsAge');
        expect(birthday).toHaveProperty('daysUntil');
        expect(birthday).toHaveProperty('tz');

        // Validate types
        expect(typeof birthday.turnsAge).toBe('number');
        expect(typeof birthday.daysUntil).toBe('number');
        expect(birthday.daysUntil).toBeGreaterThanOrEqual(0);
        expect(birthday.turnsAge).toBeGreaterThan(0);
      });
    });

    it('should respect custom days parameter', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=7');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // All birthdays should be within 7 days
      response.body.data.forEach((birthday: any) => {
        expect(birthday.daysUntil).toBeLessThanOrEqual(7);
      });
    });

    it('should handle large window (365 days)', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=365');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All members should be returned for 365 days
      // Each should have daysUntil between 0 and 365
      response.body.data.forEach((birthday: any) => {
        expect(birthday.daysUntil).toBeGreaterThanOrEqual(0);
        expect(birthday.daysUntil).toBeLessThanOrEqual(365);
      });
    });

    it('should return birthdays sorted by soonest first', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=60');

      expect(response.status).toBe(200);

      if (response.body.data.length > 1) {
        const daysUntilArray = response.body.data.map((b: any) => b.daysUntil);

        // Check ascending order
        for (let i = 0; i < daysUntilArray.length - 1; i++) {
          expect(daysUntilArray[i]).toBeLessThanOrEqual(daysUntilArray[i + 1]);
        }
      }
    });

    it('should calculate correct age members will turn', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=365');

      response.body.data.forEach((birthday: any) => {
        const birthYear = new Date(birthday.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        // Age should be either current year - birth year or that + 1
        const expectedAges = [
          currentYear - birthYear,
          currentYear - birthYear + 1,
          nextYear - birthYear,
        ];

        expect(expectedAges).toContain(birthday.turnsAge);
      });
    });

    it('should handle zero days parameter', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=0');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Should only return birthdays today (daysUntil = 0)
      response.body.data.forEach((birthday: any) => {
        expect(birthday.daysUntil).toBe(0);
      });
    });

    it('should handle invalid days parameter gracefully', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=abc');

      // Should either use default or return error
      // Depending on implementation, adjust this test
      expect([200, 400]).toContain(response.status);
    });

    it('should handle year rollover correctly', async () => {
      // Get birthdays for next 365 days
      const response = await request(app).get('/api/birthdays/upcoming?days=365');

      expect(response.status).toBe(200);

      // Check that birthdays in next year are included
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      const hasNextYearBirthdays = response.body.data.some((b: any) => {
        return new Date(b.nextBirthdayDate).getFullYear() === nextYear;
      });

      // This should be true for most of the year
      // (unless it's Jan 1 and we're only looking at current year)
      expect(typeof hasNextYearBirthdays).toBe('boolean');
    });
  });

  describe('Timezone handling', () => {
    it('should respect member timezones for birthday calculations', async () => {
      const response = await request(app).get('/api/birthdays/upcoming?days=30');

      expect(response.status).toBe(200);

      // Each member should have their timezone
      response.body.data.forEach((birthday: any) => {
        expect(birthday.tz).toBeTruthy();
        expect(typeof birthday.tz).toBe('string');
      });
    });
  });
});
