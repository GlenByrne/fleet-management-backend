import { sign } from 'jsonwebtoken';
import { APP_SECRET } from './getUserId';

const generateAccessToken = (userId: string) => {
  const token = sign(
    {
      userId,
    },
    APP_SECRET,
    {
      expiresIn: '15m',
    }
  );
  return token;
};

export default generateAccessToken;
