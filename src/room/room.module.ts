import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { UsersModule } from '../users/users.module';
import { Room } from './entities/room.entity';
import { UsersInRoom } from './entities/users-in-room.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, UsersInRoom, Message]),
    UsersModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService, TypeOrmModule],
})
export class RoomModule {}
