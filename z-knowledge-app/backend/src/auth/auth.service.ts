import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma/client';
import { loginDto } from './dto/login.dto';
import { registrationDto } from './dto/registration.dto';
import { jwtPayloadInterface } from './dto/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: registrationDto) {
    const candidate = await this.userService.findByEmail(dto.email);
    if (candidate) throw new BadRequestException('Пользователь уже существует');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
      publicKey: dto.publicKey,
    });

    return {
      user: { id: user.id, email: user.email, username: user.username },
      accessToken: this.generateToken(user).accessToken,
    };
  }

  async login(dto: loginDto) {
    const { email } = dto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return {
      accessToken: this.generateToken(user).accessToken,
      user: { userId: user.id, email: user.email, publicKey: user.publicKey },
    };
  }

  private generateToken(user: User) {
    const payload: jwtPayloadInterface = {
      sub: user.id,
      email: user.email,
      publicKey: user.publicKey,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
