import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/types/jwt-payload';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await db.query.users.findFirst({
      where: () => eq(users.username, dto.username),
    });
    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const [newUser] = await db
      .insert(users)
      .values({
        username: dto.username,
        password: hashedPassword,
      })
      .returning();

    try {
      const authToken = await this.signJwt(newUser.id);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...publicUser } = newUser;

      return {
        user: publicUser,
        authToken,
      };
    } catch {
      throw new InternalServerErrorException('Failed to generate auth token');
    }
  }

  async login(dto: LoginDto) {
    const existingUser = await db.query.users.findFirst({
      where: () => eq(users.username, dto.username),
    });
    if (!existingUser) {
      throw new BadRequestException('Credentials invalid');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Credentials invalid');
    }

    try {
      const authToken = await this.signJwt(existingUser.id);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...publicUser } = existingUser;

      return {
        user: publicUser,
        authToken,
      };
    } catch {
      throw new InternalServerErrorException('Failed to generate auth token');
    }
  }

  async verifyJwt(authToken: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(authToken);
    return payload;
  }

  private async signJwt(userId: string) {
    const payload: JwtPayload = {
      userId,
    };

    const authToken = await this.jwtService.signAsync(payload);
    return authToken;
  }
}
