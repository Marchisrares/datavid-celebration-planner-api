export interface UpcomingBirthday {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  nextBirthdayDate: string;
  turnsAge: number;
  daysUntil: number;
  tz: string;
}

export interface TodayBirthday {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  tz: string;
}
