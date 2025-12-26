import { Body, Controller, Post } from '@nestjs/common';
import { UsersDtoPost } from './dto/users.dto.post';
import { UsersService } from './users.service';
import { plainToInstance } from 'class-transformer';
import { UsersDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() dto: UsersDtoPost): UsersDto {
    console.log('dto', dto);
    console.log(process.env);

    const { id, password, email, nickname } = dto;
    const user = this.usersService.createUser(id, password, email, nickname);

    return plainToInstance(UsersDto, user);
  }
}
