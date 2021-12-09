import { sign } from 'jsonwebtoken';
import { RESET_PASSWORD_TOKEN_SECRET } from '../server';

type GenerateResetPasswordTokenInput = {
  userId: string;
};

export const generateResetPasswordToken = ({
  userId,
}: GenerateResetPasswordTokenInput) => {
  const token = sign(
    {
      userId,
    },
    RESET_PASSWORD_TOKEN_SECRET,
    {
      expiresIn: '10m',
    }
  );
  return token;
};
