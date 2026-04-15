export type UserResponseDto = {
  email: string;
  id: string;
  username: string;
  password: string;
  publicKey: string;
};

export type JwtPayload = {
  userId: string;
  email: string;
  publicKey: string;
};
