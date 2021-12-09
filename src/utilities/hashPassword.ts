import argon2 from 'argon2';

type HashPasswordInputs = {
  password: string;
};

export const hashPassword = ({ password }: HashPasswordInputs) =>
  argon2.hash(password, {
    type: argon2.argon2id,
  });
