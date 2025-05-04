export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface refreshTokenPayload {
  sub: string;
}
