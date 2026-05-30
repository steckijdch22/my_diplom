import { Response } from 'express';
import { env } from 'node:process';

export const sendAccessTokenCookie = (res: Response, accessToken: string) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production' ? true : false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const clearAccessToken = (res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
};
