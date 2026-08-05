import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateUserInput, UpdateUserPreferencesInput, UserDto } from '@elara/validation';
import type { PrismaService } from '../prisma/prisma.service';
import { toUserDto } from './users.serializer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return toUserDto(user);
  }

  async update(id: string, data: UpdateUserInput | UpdateUserPreferencesInput): Promise<UserDto> {
    const user = await this.prisma.user.update({ where: { id }, data });
    return toUserDto(user);
  }
}
