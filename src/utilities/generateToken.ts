import { sign } from 'jsonwebtoken';
import { APP_SECRET } from './getUserId';

const generateToken = (userId: string) => {
  const token = sign(
    {
      userId,
    },
    APP_SECRET,
    {
      expiresIn: '1h',
    }
  );
  return token;
};

export default generateToken;