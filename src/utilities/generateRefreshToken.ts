import { sign } from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET } from '../server';

const generateRefreshToken = (userId: string) => {
  const token = sign(
    {
      userId,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: '30d',
    }
  );
  return token;
};

export default generateRefreshToken;
