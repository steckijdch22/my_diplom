import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export const SocketAuthMiddleware = (
  jwtService: JwtService,
  configService: any,
) => {
  return (client: Socket, next: (err?: Error) => void) => {
    try {
      const rawCookies = client.handshake.headers.cookie;

      if (!rawCookies) {
        console.error(
          `[WS-Auth] Ошибка: Куки не найдены у сокета ${client.id}`,
        );
        throw new Error('No cookies found');
      }

      const token = rawCookies
        .split('; ')
        .find((cookie) => cookie.startsWith('access_token='))
        ?.split('=')[1];

      if (!token) {
        console.error(`[WS-Auth] Ошибка: access_token отсутствует`);
        throw new Error('Access token not found');
      }

      const payload = jwtService.verify(token, {
        secret: configService.get('JWT_SECRET'),
      });

      client.handshake['user'] = {
        userId: payload.sub,
        email: payload.email,
      };

      next();
    } catch (err) {
      console.error(`[WS-Auth] Авторизация провалена: ${err.message}`);
      next(new Error('Unauthorized'));
    }
  };
};
