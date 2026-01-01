import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [WebsocketGateway, JwtService],
})
export class WebsocketModule {}
