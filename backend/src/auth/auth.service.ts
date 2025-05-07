/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import {
  JwtPayload,
  refreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { Types } from 'mongoose';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
    private usersService: UsersService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findUser(email);
    if (!user) {
      throw new UnauthorizedException('User is not found!');
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      throw new UnauthorizedException('Email or password is not correct!');
    }

    // Generate access_token
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    // Generate refresh_token
    const refreshPayload: refreshTokenPayload = { sub: user.id };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // Store refresh_token to Redis
    await this.redisService.setToken(refreshToken, user.id, 7 * 24 * 3600);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload: refreshTokenPayload = this.jwtService.verify(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      const id = new Types.ObjectId(payload.sub);
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check refresh token in Redis
      const storedRefreshToken = await this.redisService.getToken(refreshToken);
      if (!storedRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access_token
      const accessPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(accessPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException(`error >>> : ${error}`);
    }
  }

  async logout(token: string): Promise<void> {
    await this.redisService.deleteToken(token);
  }
}
