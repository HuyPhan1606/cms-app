// backend/src/content.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://huyphan23.workspace.opstech.org:8081',
      'http://huyphan23.workspace.opstech.org:8082',
    ],
  },
})
export class ContentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('contentCreated')
  handleContentCreated(client: any, payload: any): void {
    this.server.emit('contentUpdated', payload);
  }

  @SubscribeMessage('contentUpdated')
  handleContentUpdated(client: any, payload: any): void {
    this.server.emit('contentUpdated', payload);
  }

  @SubscribeMessage('contentDeleted')
  handleContentDeleted(client: any, payload: any): void {
    this.server.emit('contentUpdated', payload);
  }
}
