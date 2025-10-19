export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  country: string;
  city: string;
  tz: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD format
  country: string;
  city: string;
  tz: string;
  email: string;
}

export interface UpdateMemberDto {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD format
  country: string;
  city: string;
  tz: string;
  email: string;
}
