import { sign } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../server';

const generateAccessToken = (userId: string) => {
  const token = sign(
    {
      userId,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: '15m',
    }
  );
  return token;
};

export default generateAccessToken;
