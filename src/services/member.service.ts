import { memberRepository } from '../repositories/member.repository';
import { CreateMemberDto, UpdateMemberDto, Member } from '../models/member.model';
import { DateUtils } from '../utils/date.utils';
import { NotFoundError, ConflictError, ValidationError } from '../common/errors';
import { ErrorCodes, MemberErrorMessages, HttpStatus } from '../enums';

export class MemberService {
  async getAllMembers(sort?: string): Promise<Member[]> {
    const members = await memberRepository.findAll();

    // Sort by created date (descending - newest first) or upcoming birthday (ascending - soonest first)
    if (sort === 'upcoming') {
      // Calculate next birthday for each member and sort by days until birthday
      const membersWithBirthdays = members.map(member => {
        const birthdayInfo = DateUtils.computeNextBirthday(
          member.birthDate.toISOString().split('T')[0],
          member.tz
        );
        return { ...member, daysUntil: birthdayInfo.daysUntil };
      });

      return membersWithBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
    }

    // Default sort by created date (descending - newest first)
    return members.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMemberById(id: number): Promise<Member> {
    const member = await memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError(
        MemberErrorMessages.MEMBER_NOT_FOUND_WITH_ID.replace('{id}', id.toString()),
        ErrorCodes.MEMBER_NOT_FOUND
      );
    }
    return member;
  }

  async createMember(data: CreateMemberDto): Promise<Member> {
    if (!DateUtils.isAdult(data.birthDate, data.tz)) {
      throw new ValidationError(
        MemberErrorMessages.MUST_BE_ADULT,
        ErrorCodes.MEMBER_INVALID_AGE,
        [{ field: 'birthDate', message: MemberErrorMessages.MUST_BE_ADULT }]
      );
    }

    try {
      return await memberRepository.create(data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError(
          MemberErrorMessages.ALREADY_EXISTS,
          ErrorCodes.MEMBER_ALREADY_EXISTS
        );
      }
      throw error;
    }
  }

  async updateMember(id: number, data: UpdateMemberDto): Promise<Member> {
    await this.getMemberById(id);

    if (!DateUtils.isAdult(data.birthDate, data.tz)) {
      throw new ValidationError(
        MemberErrorMessages.MUST_BE_ADULT,
        ErrorCodes.MEMBER_INVALID_AGE,
        [{ field: 'birthDate', message: MemberErrorMessages.MUST_BE_ADULT }]
      );
    }

    try {
      return await memberRepository.update(id, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError(
          MemberErrorMessages.ALREADY_EXISTS,
          ErrorCodes.MEMBER_ALREADY_EXISTS
        );
      }
      throw error;
    }
  }

  async deleteMember(id: number): Promise<void> {
    await this.getMemberById(id);
    await memberRepository.delete(id);
  }
}

export const memberService = new MemberService();
