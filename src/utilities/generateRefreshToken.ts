import { sign } from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET } from './getUserId';

const generateRefreshToken = (userId: string) => {
  const token = sign(
    {
      userId,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    }
  );
  return token;
};

export default generateRefreshToken;
