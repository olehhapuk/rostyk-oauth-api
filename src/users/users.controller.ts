import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllUsers(@Req() req: Request) {
    console.log('req.userId', req.userId);
    return await this.usersService.getAllUsers();
  }
}
