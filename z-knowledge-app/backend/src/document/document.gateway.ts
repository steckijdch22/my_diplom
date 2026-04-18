import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DocumentService } from './document.service';
import { Socket, Server } from 'socket.io';
import * as Y from 'yjs';
import { RedisService } from 'src/redis/redis.service';
import { SocketAuthMiddleware } from 'src/auth/util/auth-ws.mw';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})
export class DocumentGateway implements OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  private saveTimers = new Map<string, NodeJS.Timeout>();
  private socketToRoom = new Map<string, string>();
  private userSockets = new Map<string, Set<string>>();

  constructor(
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    server.use(SocketAuthMiddleware(this.jwtService, this.configService));
  }

  handleConnection(client: Socket) {
    const user = client.handshake['user'];
    if (user) {
      if (!this.userSockets.has(user.userId)) {
        this.userSockets.set(user.userId, new Set());
      }
      this.userSockets.get(user.userId)?.add(client.id);
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.handshake['user'];
    if (user && this.userSockets.has(user.userId)) {
      this.userSockets.get(user.userId)?.delete(client.id);
    }

    const roomId = this.socketToRoom.get(client.id);
    if (roomId) {
      const key = this.getRedisKey(roomId);
      this.socketToRoom.delete(client.id);
      const sockets = await this.server.in(roomId).fetchSockets();

      if (sockets.length === 0) {
        if (this.saveTimers.has(roomId)) {
          clearTimeout(this.saveTimers.get(roomId));
          this.saveTimers.delete(roomId);

          const finalState = await this.redisService.get(key);
          if (finalState) {
            await this.documentService.updateContent(roomId, finalState);
          }
        }
        await this.redisService.del(key);
      }
    }
    console.log(`User ${client.id} disconnected`);
  }

  @SubscribeMessage('join-document')
  async handleJoin(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake['user'];
    client.join(roomId);
    const key = this.getRedisKey(roomId);
    this.socketToRoom.set(client.id, roomId);

    let currentState = await this.redisService.get(key);

    if (!currentState) {
      const doc = await this.documentService.getRawDocument(roomId);
      if (doc?.encryptedContent) {
        currentState = new Uint8Array(doc.encryptedContent);
        await this.redisService.set(key, currentState);
      }
    }

    if (currentState) {
      client.emit('receive-update', Buffer.from(currentState));
    }

    client.to(roomId).emit('request-sync');

    console.log(`User ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('sync-update')
  handleUpdate(
    @MessageBody() data: { roomId: string; update: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, update } = data;
    const updateUint8 = new Uint8Array(update);
    client.to(roomId).emit('receive-update', updateUint8);
  }

  @SubscribeMessage('save-snapshot')
  async handleSnapshot(
    @MessageBody() data: { roomId: string; fullState: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, fullState } = data;
    const key = this.getRedisKey(roomId);
    const stateUint8 = new Uint8Array(fullState);

    await this.redisService.set(key, stateUint8);
    client.to(roomId).emit('receive-update', stateUint8);
    this.scheduleSave(roomId, stateUint8);
  }

  async kickUser(userId: string, roomId: string) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return;

    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        if (socket.rooms.has(roomId)) {
          socket.emit('kicked-from-document', { roomId });
          socket.leave(roomId);
        }
      }
    }
  }

  private scheduleSave(roomId: string, state: Uint8Array) {
    if (this.saveTimers.has(roomId)) {
      clearTimeout(this.saveTimers.get(roomId));
    }

    const timer = setTimeout(async () => {
      try {
        await this.documentService.updateContent(roomId, state);
      } catch (err) {
      } finally {
        this.saveTimers.delete(roomId);
      }
    }, 7000);

    this.saveTimers.set(roomId, timer);
  }

  private getRedisKey(roomId: string): string {
    return `doc:${roomId}`;
  }
}
