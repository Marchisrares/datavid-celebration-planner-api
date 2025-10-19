import request from 'supertest';
import express, { Express } from 'express';
import memberRoutes from '../src/routes/member.routes';
import { errorMiddleware } from '../src/common/errors';
import { prisma } from '../src/db/prisma';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/members', memberRoutes);
  app.use(errorMiddleware);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Member API Endpoints', () => {
  describe('POST /api/members', () => {
    it('should create a valid member who is 18+ years old', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'TestUser',
          lastName: 'Integration',
          birthDate: '1995-06-15',
          country: 'USA',
          city: 'TestCity',
          tz: 'America/New_York',
          email: `test${Date.now()}@example.com`,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe('TestUser');
      expect(response.body.data.email).toContain('test');

      // Cleanup
      if (response.body.data?.id) {
        await prisma.member.delete({ where: { id: response.body.data.id } });
      }
    });

    it('should reject member under 18 years old', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'Young',
          lastName: 'Person',
          birthDate: '2010-01-01',
          country: 'USA',
          city: 'Boston',
          tz: 'America/New_York',
          email: 'young@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('18');
    });

    it('should reject duplicate member (same firstName, lastName, country, city)', async () => {
      const memberData = {
        firstName: 'Duplicate',
        lastName: 'Test',
        birthDate: '1990-01-01',
        country: 'TestCountry',
        city: 'TestCity',
        tz: 'UTC',
        email: `dup1${Date.now()}@test.com`,
      };

      // Create first member
      const first = await request(app).post('/api/members').send(memberData);
      expect(first.status).toBe(201);

      // Try to create duplicate with different email
      const duplicate = await request(app)
        .post('/api/members')
        .send({
          ...memberData,
          email: `dup2${Date.now()}@test.com`,
        });

      expect(duplicate.status).toBe(409);
      expect(duplicate.body.error.message).toContain('already exists');

      // Cleanup
      if (first.body.data?.id) {
        await prisma.member.delete({ where: { id: first.body.data.id } });
      }
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'Missing',
          // Missing lastName, birthDate, etc.
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'Invalid',
          lastName: 'Email',
          birthDate: '1990-01-01',
          country: 'USA',
          city: 'Boston',
          tz: 'America/New_York',
          email: 'not-an-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/members', () => {
    it('should return all members', async () => {
      const response = await request(app).get('/api/members');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return members sorted by created date', async () => {
      const response = await request(app).get('/api/members?sort=created');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check if sorted by createdAt descending (newest first)
      if (response.body.data.length > 1) {
        const dates = response.body.data.map((m: any) => new Date(m.createdAt).getTime());
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
        }
      }
    });

    it('should return members sorted by upcoming birthday', async () => {
      const response = await request(app).get('/api/members?sort=upcoming');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check if has daysUntil field when sorting by upcoming
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('daysUntil');

        // Check if sorted ascending (soonest first)
        if (response.body.data.length > 1) {
          const days = response.body.data.map((m: any) => m.daysUntil);
          for (let i = 0; i < days.length - 1; i++) {
            expect(days[i]).toBeLessThanOrEqual(days[i + 1]);
          }
        }
      }
    });
  });

  describe('GET /api/members/:id', () => {
    it('should return a member by ID', async () => {
      // Assuming member with ID 1 exists
      const response = await request(app).get('/api/members/1');

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.id).toBe(1);
      } else {
        // If member doesn't exist, should return 404
        expect(response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app).get('/api/members/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/members/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/members/:id', () => {
    it('should update an existing member', async () => {
      // First create a member
      const created = await request(app)
        .post('/api/members')
        .send({
          firstName: 'UpdateTest',
          lastName: 'User',
          birthDate: '1990-01-01',
          country: 'USA',
          city: 'UpdateCity',
          tz: 'UTC',
          email: `update${Date.now()}@test.com`,
        });

      expect(created.status).toBe(201);
      const memberId = created.body.data.id;

      // Update the member
      const updated = await request(app)
        .put(`/api/members/${memberId}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          birthDate: '1990-01-01',
          country: 'USA',
          city: 'UpdateCity',
          tz: 'UTC',
          email: `update${Date.now()}@test.com`,
        });

      expect(updated.status).toBe(200);
      expect(updated.body.data.firstName).toBe('Updated');

      // Cleanup
      await prisma.member.delete({ where: { id: memberId } });
    });

    it('should not allow updating to under 18 years old', async () => {
      const response = await request(app)
        .put('/api/members/1')
        .send({
          firstName: 'Test',
          lastName: 'User',
          birthDate: '2010-01-01',
          country: 'USA',
          city: 'Test',
          tz: 'UTC',
          email: 'test@test.com',
        });

      if (response.status !== 404) {
        // If member exists, should reject age < 18
        expect(response.status).toBe(400);
      }
    });
  });

  describe('DELETE /api/members/:id', () => {
    it('should delete an existing member', async () => {
      // First create a member
      const created = await request(app)
        .post('/api/members')
        .send({
          firstName: 'DeleteTest',
          lastName: 'User',
          birthDate: '1990-01-01',
          country: 'USA',
          city: 'DeleteCity',
          tz: 'UTC',
          email: `delete${Date.now()}@test.com`,
        });

      expect(created.status).toBe(201);
      const memberId = created.body.data.id;

      // Delete the member
      const deleted = await request(app).delete(`/api/members/${memberId}`);

      expect(deleted.status).toBe(204);

      // Verify it's deleted
      const check = await request(app).get(`/api/members/${memberId}`);
      expect(check.status).toBe(404);
    });

    it('should return 404 when deleting non-existent member', async () => {
      const response = await request(app).delete('/api/members/99999');

      expect(response.status).toBe(404);
    });
  });
});
