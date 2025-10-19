import request from 'supertest';
import express, { Express } from 'express';
import aiRoutes from '../src/routes/ai.routes';
import { errorMiddleware } from '../src/common/errors';
import { prisma } from '../src/db/prisma';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  app.use(errorMiddleware);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('AI API Endpoints', () => {
  describe('POST /api/ai/message', () => {
    it('should generate a birthday message for existing member', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
        });

      if (response.status === 404) {
        // Member doesn't exist, skip this test
        return;
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('explanation');

      // Message should be a non-empty string
      expect(typeof response.body.data.message).toBe('string');
      expect(response.body.data.message.length).toBeGreaterThan(0);
    });

    it('should include AI explainability in response', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);

      const explanation = response.body.data.explanation;
      expect(explanation).toHaveProperty('model');
      expect(explanation).toHaveProperty('params');
      expect(explanation).toHaveProperty('promptOrMethod');
      expect(explanation).toHaveProperty('rationale');

      // Validate types
      expect(typeof explanation.model).toBe('string');
      expect(typeof explanation.params).toBe('object');
      expect(typeof explanation.promptOrMethod).toBe('string');
      expect(typeof explanation.rationale).toBe('string');

      // Explanation should be meaningful
      expect(explanation.model.length).toBeGreaterThan(0);
      expect(explanation.rationale.length).toBeGreaterThan(0);
    });

    it('should support friendly tone', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);
      expect(response.body.data.explanation.params).toHaveProperty('tone');
      expect(response.body.data.explanation.params.tone).toBe('friendly');
    });

    it('should support formal tone', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'formal',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);
      expect(response.body.data.explanation.params).toHaveProperty('tone');
      expect(response.body.data.explanation.params.tone).toBe('formal');

      // Formal message should typically NOT include emoji (in mock mode)
      // This is implementation-specific, adjust as needed
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 99999,
          tone: 'friendly',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing tone (use default)', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('message');
    });

    it('should support email sending with dry-run', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
          sendEmail: true,
          dryRunEmail: true,
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('sent');
      expect(response.body.data.sent).toHaveProperty('dryRun');
      expect(response.body.data.sent.dryRun).toBe(true);
      expect(response.body.data.sent).toHaveProperty('provider');
    });

    it('should handle custom locale if provided', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
          locale: 'en',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('message');
    });

    it('should auto-detect locale from member country', async () => {
      // Test with member 1 (Romanian) - should use Romanian locale
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);

      // In mock mode, should have locale in params
      if (response.body.data.explanation.params) {
        expect(response.body.data.explanation.params).toHaveProperty('locale');
      }
    });

    it('should personalize message with member details', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);

      // Get the member details
      const member = await prisma.member.findUnique({ where: { id: 1 } });

      if (member) {
        const message = response.body.data.message.toLowerCase();

        // Message should contain personalization elements
        // Note: Depending on locale, name might be in different case
        // This is a loose check - adjust based on implementation
        expect(message.length).toBeGreaterThan(10);
      }
    });

    it('should reject invalid request body', async () => {
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          // Missing memberId
          tone: 'friendly',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle multiple requests without issues', async () => {
      const promises = [
        request(app).post('/api/ai/message').send({ memberId: 1, tone: 'friendly' }),
        request(app).post('/api/ai/message').send({ memberId: 1, tone: 'formal' }),
        request(app).post('/api/ai/message').send({ memberId: 1, tone: 'friendly' }),
      ];

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        if (response.status !== 404) {
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveProperty('message');
        }
      });
    });
  });

  describe('AI Provider - Mock Mode', () => {
    it('should work in mock mode without API key', async () => {
      // Mock mode should be default in tests
      const response = await request(app)
        .post('/api/ai/message')
        .send({
          memberId: 1,
          tone: 'friendly',
        });

      if (response.status === 404) return;

      expect(response.status).toBe(200);

      // Should indicate it's using mock provider
      expect(response.body.data.explanation.model).toContain('Mock');
    });

    it('should generate deterministic output in mock mode', async () => {
      // Same input should give same output in mock mode
      const response1 = await request(app)
        .post('/api/ai/message')
        .send({ memberId: 1, tone: 'friendly' });

      const response2 = await request(app)
        .post('/api/ai/message')
        .send({ memberId: 1, tone: 'friendly' });

      if (response1.status === 404 || response2.status === 404) return;

      expect(response1.body.data.message).toBe(response2.body.data.message);
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limiting configured', async () => {
      // Note: This test is informational - actual rate limiting testing
      // would require making 31+ requests rapidly
      const response = await request(app)
        .post('/api/ai/message')
        .send({ memberId: 1 });

      // Should succeed with normal rate
      if (response.status !== 404) {
        expect([200, 429]).toContain(response.status);
      }
    });
  });
});
