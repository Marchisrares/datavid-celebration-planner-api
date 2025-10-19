import { prisma } from '../db/prisma';
import { CreateMemberDto, UpdateMemberDto, Member } from '../models/member.model';

export class MemberRepository {
  async findAll(): Promise<Member[]> {
    return prisma.member.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number): Promise<Member | null> {
    return prisma.member.findUnique({
      where: { id }
    });
  }

  async create(data: CreateMemberDto): Promise<Member> {
    return prisma.member.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: new Date(data.birthDate),
        country: data.country,
        city: data.city,
        tz: data.tz,
        email: data.email
      }
    });
  }

  async update(id: number, data: UpdateMemberDto): Promise<Member> {
    return prisma.member.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: new Date(data.birthDate),
        country: data.country,
        city: data.city,
        tz: data.tz,
        email: data.email
      }
    });
  }

  async delete(id: number): Promise<Member> {
    return prisma.member.delete({
      where: { id }
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.member.count({
      where: { id }
    });
    return count > 0;
  }
}

export const memberRepository = new MemberRepository();
