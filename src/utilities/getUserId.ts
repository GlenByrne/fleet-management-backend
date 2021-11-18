import { verify } from 'jsonwebtoken';
import { Context } from '../context';
import APP_SECRET from '../server';

interface Token {
  userId: string;
}

export const getUserId = (context: Context) => {
  const authHeader = context.req.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const verifiedToken = verify(token, APP_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }
  return null;
};

export default getUserId;
