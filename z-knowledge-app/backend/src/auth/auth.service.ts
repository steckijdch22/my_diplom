import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(dto: any) {
    const candidate = await this.userService.findByEmail(dto.email);
    if (candidate) throw new BadRequestException('Пользователь уже существует');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
    });

    return user;
  }
}
