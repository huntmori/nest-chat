import { PartialType } from '@nestjs/swagger';
import { RoomPostDto } from './room.post.dto';

export class RoomUpdateDto extends PartialType(RoomPostDto) {}
