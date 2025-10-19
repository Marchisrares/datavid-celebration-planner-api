import { Request, Response, NextFunction } from 'express';
import { birthdayService } from '../services/birthday.service';
import { HttpStatus } from '../enums';

export class BirthdayController {
  async getUpcoming(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const birthdays = await birthdayService.getUpcomingBirthdays(days);
      res.status(HttpStatus.OK).json({
        success: true,
        data: birthdays
      });
    } catch (error) {
      next(error);
    }
  }

  async getToday(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const birthdays = await birthdayService.getTodayBirthdays();
      res.status(HttpStatus.OK).json({
        success: true,
        data: birthdays
      });
    } catch (error) {
      next(error);
    }
  }
}

export const birthdayController = new BirthdayController();
