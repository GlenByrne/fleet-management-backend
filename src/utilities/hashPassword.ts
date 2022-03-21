import argon2 from 'argon2';

type HashPasswordInputs = {
  password: string;
};

const hashPassword = ({ password }: HashPasswordInputs) =>
  argon2.hash(password, {
    type: argon2.argon2id,
  });

export default hashPassword;
