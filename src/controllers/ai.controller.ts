import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service';
import { MockAiProvider } from '../services/providers/mock-ai.provider';
import { OpenAiProvider } from '../services/providers/openai-ai.provider';
import { ConsoleEmailSender } from '../services/providers/console-email.sender';
import { SmtpEmailSender } from '../services/providers/smtp-email.sender';
import { aiMessageValidationSchema } from '../utils/validation.utils';
import { ValidationError } from '../common/errors';
import { ErrorCodes, ValidationErrorMessages, HttpStatus } from '../enums';
import { env } from '../config/env';
import { z } from 'zod';
import { AiProvider } from '../services/providers/ai-provider.interface';

// Select AI provider based on environment configuration
const getAiProvider = (): AiProvider => {
  if (env.aiProvider === 'openai') {
    return new OpenAiProvider();
  }
  return MockAiProvider;
};

const aiProvider = getAiProvider();
const emailSender = env.emailProvider === 'smtp' ? new SmtpEmailSender() : new ConsoleEmailSender();
const aiService = new AiService(aiProvider, emailSender);

export class AiController {
  async generateMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = aiMessageValidationSchema.parse(req.body);
      const result = await aiService.generateBirthdayMessage(validatedData);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(
          ValidationErrorMessages.VALIDATION_ERROR,
          ErrorCodes.VALIDATION_ERROR,
          error.issues
        ));
      } else {
        next(error);
      }
    }
  }
}

export const aiController = new AiController();
