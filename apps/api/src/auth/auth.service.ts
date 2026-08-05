import { randomUUID } from 'crypto';
import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type ms from 'ms';
import type {
  AuthTokens,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UserDto,
} from '@elara/validation';
import type { PrismaService } from '../prisma/prisma.service';
import { toUserDto } from '../users/users.serializer';
import { expiryDateFromNow } from './token.util';

const PASSWORD_SALT_ROUNDS = 12;
const RESET_TOKEN_TTL = '1h';

export interface AuthResult {
  user: UserDto;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: input.email, passwordHash, name: input.name },
    });

    return { user: toUserDto(user), tokens: await this.issueTokenPair(user.id, user.email) };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return { user: toUserDto(user), tokens: await this.issueTokenPair(user.id, user.email) };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { userId, jti } = this.verifyRefreshToken(refreshToken);

    const record = await this.prisma.refreshToken.findUnique({ where: { id: jti } });
    if (!record || record.userId !== userId)
      throw new UnauthorizedException('Invalid refresh token');
    if (record.revokedAt) throw new UnauthorizedException('Refresh token has been revoked');
    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const matches = await bcrypt.compare(refreshToken, record.tokenHash);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');

    // Rotation: revoke the used refresh token, issue a brand new pair.
    await this.prisma.refreshToken.update({
      where: { id: jti },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(user.id, user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const { jti } = this.verifyRefreshToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { id: jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Logout is best-effort: an already-invalid/expired token has nothing
      // left to revoke, so there's nothing to report back to the client.
    }
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    // Always behave identically whether or not the email exists, so this
    // endpoint can't be used to enumerate registered accounts.
    if (!user) return;

    const jti = randomUUID();
    const resetToken = this.jwt.sign(
      { sub: user.id, jti, type: 'password-reset' },
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: RESET_TOKEN_TTL },
    );
    const tokenHash = await bcrypt.hash(resetToken, PASSWORD_SALT_ROUNDS);

    await this.prisma.passwordResetToken.create({
      data: { id: jti, userId: user.id, tokenHash, expiresAt: expiryDateFromNow(RESET_TOKEN_TTL) },
    });

    // No email provider is wired up yet (that's a later phase) — log the
    // link so the reset flow is exercisable end-to-end in development.
    this.logger.log(`Password reset requested for ${user.email}. Token (dev only): ${resetToken}`);
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { userId, jti, type } = this.verifyResetToken(input.token);
    if (type !== 'password-reset') throw new UnauthorizedException('Invalid reset token');

    const record = await this.prisma.passwordResetToken.findUnique({ where: { id: jti } });
    if (!record || record.userId !== userId) throw new UnauthorizedException('Invalid reset token');
    if (record.usedAt) throw new UnauthorizedException('Reset token has already been used');
    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const matches = await bcrypt.compare(input.token, record.tokenHash);
    if (!matches) throw new UnauthorizedException('Invalid reset token');

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({
        where: { id: jti },
        data: { usedAt: new Date() },
      }),
      // Resetting the password revokes every existing session.
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async issueTokenPair(userId: string, email: string): Promise<AuthTokens> {
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m') as ms.StringValue;
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '30d') as ms.StringValue;

    const accessToken = this.jwt.sign(
      { sub: userId, email },
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: accessTtl },
    );

    const jti = randomUUID();
    const refreshToken = this.jwt.sign(
      { sub: userId, jti },
      { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: refreshTtl },
    );
    const expiresAt = expiryDateFromNow(refreshTtl);
    const tokenHash = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);

    await this.prisma.refreshToken.create({
      data: { id: jti, userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken, expiresAt: expiresAt.toISOString() };
  }

  private verifyRefreshToken(token: string): { userId: string; jti: string } {
    try {
      const payload = this.jwt.verify<{ sub: string; jti: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      return { userId: payload.sub, jti: payload.jti };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private verifyResetToken(token: string): { userId: string; jti: string; type: string } {
    try {
      const payload = this.jwt.verify<{ sub: string; jti: string; type: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      return { userId: payload.sub, jti: payload.jti, type: payload.type };
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
