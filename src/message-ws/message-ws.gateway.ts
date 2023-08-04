import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MessageWsService } from './message-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);

    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client.id);
  }

  @SubscribeMessage('message-form-client')
  handleMessageFormClient(client: Socket, payload: NewMessageDto) {

    //Solo emite al cliente
    // client.emit('message-form-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!',
    // });

    //! Emite a todos MENOS al cliente inicial
    // client.broadcast.emit('message-form-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!',
    // });

    this.wss.emit('message-form-server', {
      fullName: this.messageWsService.getUserName(client.id),
      message: payload.message || 'no-message!!',
    });

  }
}
