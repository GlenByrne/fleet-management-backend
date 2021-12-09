import { verify } from 'jsonwebtoken';
import { Context } from '../context';
import { ACCESS_TOKEN_SECRET } from '../server';

interface Token {
  userId: string;
}

export const verifyAccessToken = (context: Context) => {
  const authHeader = context.req.get('Authorization');

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const verifiedToken = verify(token, ACCESS_TOKEN_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }
  return null;
};
