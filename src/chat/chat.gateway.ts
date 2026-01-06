import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'node:net';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  clients = new Map<string, any>();

  afterInit(server: Server) {
    this.server = server;
  }
  handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ) {
    this.logger.log(`handleConnection: ${client.id}, data: ${data}`);
    this.logger.log(
      `token ?? : ${client.handshake.auth.token ?? 'not provided'}`,
    );
  }
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`handleDisconnect: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: any,
  ): string {
    this.logger.log(`handleMessage: ${client.id}, payload: ${payload}`);

    return 'Hello world!';
  }
}
