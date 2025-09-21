import { db } from '@/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async getAllUsers() {
    return await db.query.users.findMany({
      columns: {
        id: true,
        username: true,
      },
    });
  }
}
