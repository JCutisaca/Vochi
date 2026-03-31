import { Request } from 'express';
import { Socket } from 'socket.io';

function normalizeToken(value: string): string {
  return value.replace(/^Bearer\s+/i, '').trim();
}

function extractBearerToken(value: string): string | null {
  if (!/^Bearer\s+/i.test(value)) {
    return null;
  }

  const token = normalizeToken(value);
  return token.length > 0 ? token : null;
}

export function extractBearerTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return null;
  }

  return extractBearerToken(authHeader);
}

export function extractTokenFromSocket(client: Socket): string | null {
  const handshakeToken = client.handshake.auth?.token;
  if (typeof handshakeToken === 'string') {
    const token = normalizeToken(handshakeToken);
    if (token.length > 0) {
      return token;
    }
  }

  const queryToken = client.handshake.query.token;
  if (typeof queryToken === 'string') {
    const token = normalizeToken(queryToken);
    if (token.length > 0) {
      return token;
    }
  }

  const authHeader = client.handshake.headers.authorization;
  if (typeof authHeader === 'string') {
    const token = extractBearerToken(authHeader);
    if (token) {
      return token;
    }
  }

  return null;
}
