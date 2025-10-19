import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import { memberValidationSchema } from '../utils/validation.utils';
import { ValidationError } from '../common/errors';
import { ErrorCodes, MemberErrorMessages, ValidationErrorMessages, HttpStatus } from '../enums';
import { z } from 'zod';

export class MemberController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sort = req.query.sort as string | undefined;
      const members = await memberService.getAllMembers(sort);
      res.status(HttpStatus.OK).json({
        success: true,
        data: members
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ValidationError(
          MemberErrorMessages.INVALID_ID,
          ErrorCodes.MEMBER_INVALID_ID
        );
      }
      const member = await memberService.getMemberById(id);
      res.status(HttpStatus.OK).json({
        success: true,
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = memberValidationSchema.parse(req.body);
      const member = await memberService.createMember(validatedData);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: member
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ValidationError(
          MemberErrorMessages.INVALID_ID,
          ErrorCodes.MEMBER_INVALID_ID
        );
      }
      const validatedData = memberValidationSchema.parse(req.body);
      const member = await memberService.updateMember(id, validatedData);
      res.status(HttpStatus.OK).json({
        success: true,
        data: member
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

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ValidationError(
          MemberErrorMessages.INVALID_ID,
          ErrorCodes.MEMBER_INVALID_ID
        );
      }
      await memberService.deleteMember(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export const memberController = new MemberController();
