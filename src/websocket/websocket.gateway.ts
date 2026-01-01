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
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.gaurd';
import { SocketWithUserDto } from './dto/socket-with-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Cron } from '@nestjs/schedule';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(WebsocketGateway.name);

  // 메모리에서 소켓 커넥션을 관리하기 위한 Map
  // Key: socket.id (또는 userId 등), Value: Socket
  private readonly clients = new Map<string, Socket>();

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  @WebSocketServer()
  private server: Server;

  @Cron('0 * * * * *')
  socketMonitor() {
    this.logger.log(`Current connected clients: ${this.clients.size}`);
    this.clients.forEach((client) => {
      this.logger.log(
        `/socketMonitor => client address: ` + client.handshake.address,
      );
    });
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket gateway initialized');
    this.logger.log('server is ' + server.constructor.name);
    this.logger.log('server is ' + typeof server);
    this.server = server;
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const logPrefix = 'handleConnection=>';

    // 쿼리 스트링이나 인증 정보를 통해 userId를 가져올 수 있다면 이를 키로 사용할 수 있습니다.
    // 여기서는 기본적으로 socket.id를 사용하지만, 필요시 로직을 확장할 수 있습니다.
    const authValue = client.handshake.headers.authorization;
    if (!authValue) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authValue.split(' ')[1];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = this.jwtService.decode(token);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userIdx = parseInt(decoded['sub'] as string);
    const user = await this.usersService.getOneByIdx(userIdx);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    this.logger.log(`${logPrefix} Client connected: ${user.uuid}`);

    this.clients.set(user.uuid, client);

    this.logger.log(
      `${logPrefix} Current connected clients: ${this.clients.size}`,
    );
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    let userUuid = '';
    this.clients.forEach((socket, key) => {
      if (socket === client) {
        userUuid = key;
      }
    });

    this.clients.delete(userUuid);
    this.logger.log(`Client disconnected: ${userUuid}`);
    this.logger.log(`Current connected clients: ${this.clients.size}`);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: SocketWithUserDto,
    @MessageBody() payload: any,
  ): string {
    this.logger.log(`/message => Client is : ${client.user.userIdx}`);
    this.logger.log(`/message => client address: ` + client.handshake.address);
    this.logger.log(
      `/message => Client sent message: ${JSON.stringify(payload)}`,
    );
    return 'Hello world!';
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('events')
  //handelEvent(@MessageBody('id) id: number): number {
  //handelEvent(@MessageBody() data: string): string {
  //handelEvent(client: Socket, data: string): string {
  handelEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: SocketWithUserDto,
  ): string {
    this.logger.log(`/events => Client is : ${client.user.userIdx}`);
    this.logger.log(`/events => client address: ` + client.handshake.address);
    this.logger.log(`/events => Client sent event:` + JSON.stringify(data));
    return `Event received: ${data}`;
  }
}
