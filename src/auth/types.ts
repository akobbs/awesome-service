import { User } from '../users/user.entity';

export type UserProfileResponse = AccessTokenPayload;

export type AccessTokenPayload = {
  sub: number; // user.id
  email: string;
};

export type RefreshTokenPayload = {
  sub: number; // user.id
  email: string;
};

export type TokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = User;
export type LoginResponse = TokensResponse;
export type RefreshTokenResponse = TokensResponse;
