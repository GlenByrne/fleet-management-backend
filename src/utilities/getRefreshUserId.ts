import { verify } from 'jsonwebtoken';
import { Context } from '../context';
import { REFRESH_TOKEN_SECRET } from '../server';

interface Token {
  userId: string;
}

const getRefreshUserId = (context: Context) => {
  const { refreshToken } = context.req.cookies;

  if (refreshToken) {
    const token = refreshToken.replace('Bearer ', '');
    const verifiedToken = verify(token, REFRESH_TOKEN_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }
  return null;
};

export default getRefreshUserId;
