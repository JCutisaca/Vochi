import { Request } from 'express';
import { Socket } from 'socket.io';

export interface AuthenticatedUser {
  userId: string;
  email: string | null;
  firebaseUid: string;
}

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
  userId: string;
  email: string | null;
  firebaseUid: string;
};

export type AuthenticatedSocket = Socket & {
  data: {
    user?: AuthenticatedUser;
    userId?: string;
    email?: string | null;
    firebaseUid?: string;
    [key: string]: unknown;
  };
};
