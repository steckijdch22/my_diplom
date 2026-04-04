import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DocumentService } from './document.service';
import { Socket, Server } from 'socket.io';
import * as Y from 'yjs';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class DocumentGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private documentStates = new Map<string, Uint8Array>();
  private saveTimers = new Map<string, NodeJS.Timeout>();

  private socketToRoom = new Map<string, string>();

  constructor(private readonly documentService: DocumentService) {}

  @SubscribeMessage('join-document')
  async handleJoin(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);

    this.socketToRoom.set(client.id, roomId);

    let currentState = this.documentStates.get(roomId);

    if (!currentState) {
      const doc = await this.documentService.getDocument(roomId);
      if (doc?.encryptedContent) {
        currentState = new Uint8Array(doc.encryptedContent);
        this.documentStates.set(roomId, currentState);
      }
    }

    if (currentState) {
      client.emit('receive-update', Buffer.from(currentState));
    }

    console.log(`User ${client.id} joined room ${roomId}`);
  }

  async handleDisconnect(client: Socket) {
    const roomId = this.socketToRoom.get(client.id);
    if (roomId) {
      this.socketToRoom.delete(client.id);
      const sockets = await this.server.in(roomId).fetchSockets();

      if (sockets.length === 0) {
        if (this.saveTimers.has(roomId)) {
          clearTimeout(this.saveTimers.get(roomId));
          this.saveTimers.delete(roomId);

          const finalState = this.documentStates.get(roomId);
          if (finalState) {
            await this.documentService.updateContent(roomId, finalState);
          }
        }
        this.documentStates.delete(roomId);
      }
    }
    console.log(`User ${client.id} disconnected`);
  }

  @SubscribeMessage('sync-update')
  handleUpdate(
    @MessageBody() data: { roomId: string; update: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, update } = data;

    const updateUint8 = new Uint8Array(update);
    client.to(roomId).emit('receive-update', updateUint8);

    const prevState = this.documentStates.get(roomId);
    let mergedState: Uint8Array;
    if (prevState && prevState.length > 0) {
      try {
        mergedState = Y.mergeUpdates([prevState, updateUint8]);
      } catch (e) {
        console.error('❌ Ошибка при слиянии Yjs:', e);
        mergedState = updateUint8;
      }
    } else {
      mergedState = updateUint8;
    }
    this.documentStates.set(roomId, mergedState);

    this.scheduleSave(roomId, mergedState);
  }

  private scheduleSave(roomId: string, state: Uint8Array) {
    if (this.saveTimers.has(roomId)) {
      clearTimeout(this.saveTimers.get(roomId));
    }

    const timer = setTimeout(async () => {
      await this.documentService.updateContent(roomId, Buffer.from(state));
      this.saveTimers.delete(roomId);
    }, 5000);

    this.saveTimers.set(roomId, timer);
  }
}
