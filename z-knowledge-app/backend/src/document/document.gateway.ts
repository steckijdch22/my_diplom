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
import { forwardRef, Inject, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})
export class DocumentGateway implements OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('DocumentGateway'); // Используем встроенный логгер NestJS

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
    this.logger.log('🔐 WebSocket Auth Middleware успешно подключен');
  }

  handleConnection(client: Socket) {
    const user = client.handshake['user'];
    if (user) {
      if (!this.userSockets.has(user.userId)) {
        this.userSockets.set(user.userId, new Set());
      }
      this.userSockets.get(user.userId)?.add(client.id);
      this.logger.debug(
        `📡 Соединение установлено: ${client.id} (User: ${user.email})`,
      );
    }
  }

  @SubscribeMessage('join-document')
  async handleJoin(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const startTime = Date.now();
    const user = client.handshake['user'];
    client.join(roomId);
    const key = this.getRedisKey(roomId);
    this.socketToRoom.set(client.id, roomId);

    let currentState = await this.redisService.get(key);
    let source = 'Redis Cache';

    if (!currentState) {
      const doc = await this.documentService.getRawDocument(roomId);
      if (doc?.encryptedContent) {
        currentState = new Uint8Array(doc.encryptedContent);
        await this.redisService.set(key, currentState);
        source = 'PostgreSQL';
      }
    }

    if (currentState) {
      const sizeKB = (currentState.length / 1024).toFixed(2);
      client.emit('receive-update', Buffer.from(currentState));
      this.logger.log(
        `📥 [Join] Room: ${roomId} | Source: ${source} | Size: ${sizeKB} KB | Time: ${Date.now() - startTime}ms`,
      );
    } else {
      this.logger.log(
        `📥 [Join] Room: ${roomId} | Status: New Document | Time: ${Date.now() - startTime}ms`,
      );
    }

    client.to(roomId).emit('request-sync');
  }

  @SubscribeMessage('sync-update')
  handleUpdate(
    @MessageBody() data: { roomId: string; update: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, update } = data;
    const updateUint8 = new Uint8Array(update);

    // Логируем только объем инкрементальных правок
    // (обычно они маленькие, поэтому в байтах)
    this.logger.verbose(
      `🔄 [Sync] Room: ${roomId} | Delta Size: ${updateUint8.length} bytes`,
    );

    client.to(roomId).emit('receive-update', updateUint8);
  }

  @SubscribeMessage('save-snapshot')
  async handleSnapshot(
    @MessageBody() data: { roomId: string; fullState: any },
    @ConnectedSocket() client: Socket,
  ) {
    const startTime = Date.now();
    const { roomId, fullState } = data;
    const key = this.getRedisKey(roomId);
    const stateUint8 = new Uint8Array(fullState);
    const sizeKB = (stateUint8.length / 1024).toFixed(2);

    // 1. Быстрое сохранение в Redis
    await this.redisService.set(key, stateUint8);

    // 2. Рассылка новичкам
    client.to(roomId).emit('receive-update', stateUint8);

    this.logger.log(
      `💾 [Snapshot] Room: ${roomId} | Total Size: ${sizeKB} KB | Redis write: ${Date.now() - startTime}ms`,
    );

    // 3. Планируем запись в тяжелую БД
    this.scheduleSave(roomId, stateUint8);
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
        this.logger.log(
          `🏠 [Room] ${roomId} пуста. Выполнение финальной очистки...`,
        );

        if (this.saveTimers.has(roomId)) {
          clearTimeout(this.saveTimers.get(roomId));
          this.saveTimers.delete(roomId);

          const finalState = await this.redisService.get(key);
          if (finalState) {
            await this.documentService.updateContent(roomId, finalState);
            this.logger.log(
              `💾 [Final Save] Room: ${roomId} persisted to DB before close.`,
            );
          }
        }
        await this.redisService.del(key);
      }
    }
  }

  private scheduleSave(roomId: string, state: Uint8Array) {
    if (this.saveTimers.has(roomId)) {
      clearTimeout(this.saveTimers.get(roomId));
    }

    const timer = setTimeout(async () => {
      const dbStartTime = Date.now();
      try {
        await this.documentService.updateContent(roomId, state);
        const duration = Date.now() - dbStartTime;
        const sizeKB = (state.length / 1024).toFixed(2);
        this.logger.log(
          `☁️ [Postgres] Persistence OK | Room: ${roomId} | Size: ${sizeKB} KB | Write Time: ${duration}ms`,
        );
      } catch (err) {
        this.logger.error(
          `❌ [Postgres] Error saving room ${roomId}: ${err.message}`,
        );
      } finally {
        this.saveTimers.delete(roomId);
      }
    }, 7000);

    this.saveTimers.set(roomId, timer);
  }

  async kickUser(userId: string, roomId: string) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return;

    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket && socket.rooms.has(roomId)) {
        socket.emit('kicked-from-document', { roomId });
        socket.leave(roomId);
        this.logger.warn(
          `🚫 [Kick] User ${userId} evicted from room ${roomId}`,
        );
      }
    }
  }

  private getRedisKey(roomId: string): string {
    return `doc:${roomId}`;
  }
}
