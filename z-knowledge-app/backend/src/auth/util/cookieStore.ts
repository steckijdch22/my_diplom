import { Response } from 'express';

export const sendAccessTokenCookie = (res: Response, accessToken: string) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};
