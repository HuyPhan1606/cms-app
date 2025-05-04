// backend/src/content.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:8081'],
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
