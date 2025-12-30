import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);

  // 메모리에서 소켓 커넥션을 관리하기 위한 Map
  // Key: socket.id (또는 userId 등), Value: Socket
  private readonly clients = new Map<string, Socket>();

  handleConnection(@ConnectedSocket() client: Socket) {
    // 쿼리 스트링이나 인증 정보를 통해 userId를 가져올 수 있다면 이를 키로 사용할 수 있습니다.
    // 여기서는 기본적으로 socket.id를 사용하지만, 필요시 로직을 확장할 수 있습니다.
    const userId = client.handshake.query.userId as string;
    const key = userId || client.id;

    this.clients.set(key, client);
    this.logger.log(`Client connected: ${key}`);
    this.logger.log(`Current connected clients: ${this.clients.size}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    const key = userId || client.id;

    this.clients.delete(key);
    this.logger.log(`Client disconnected: ${key}`);
    this.logger.log(`Current connected clients: ${this.clients.size}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): string {
    this.logger.log(`/message => client address: `, client.handshake.address)
    this.logger.log(`/message => Client sent message: ${payload}`);
    return 'Hello world!';
  }

  @SubscribeMessage('events')
  //handelEvent(@MessageBody('id) id: number): number {
  //handelEvent(@MessageBody() data: string): string {
  //handelEvent(client: Socket, data: string): string {
  handelEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    this.logger.log(`/events => client address: `, client.handshake.address);
    this.logger.log(`/events => Client sent event:`, data);
    return `Event received: ${data}`;
  }
}
