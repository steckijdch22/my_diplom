import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async findByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
