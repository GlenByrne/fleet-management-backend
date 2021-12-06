import { sign } from 'jsonwebtoken';
import { ACTIVATION_TOKEN_SECRET } from '../server';

type ActivationTokenInput = {
  name: string;
  email: string;
  password: string;
};

const generateActivationToken = ({
  name,
  email,
  password,
}: ActivationTokenInput) =>
  sign(
    {
      name,
      email,
      password,
    },
    ACTIVATION_TOKEN_SECRET,
    {
      expiresIn: '10m',
    }
  );

export default generateActivationToken;
