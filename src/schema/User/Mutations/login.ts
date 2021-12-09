import {
  inputObjectType,
  objectType,
  mutationField,
  nonNull,
  arg,
} from 'nexus';
import { Context } from 'src/context';
import argon2 from 'argon2';
import { generateAccessToken } from '@/utilities/generateAccessToken';
import { generateRefreshToken } from '@/utilities/generateRefreshToken';
import { User } from '@/schema/User/User';

export const LoginInput = inputObjectType({
  name: 'LoginInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

export const LoginPayload = objectType({
  name: 'LoginPayload',
  definition(t) {
    t.field('user', {
      type: User,
    });
    t.nonNull.string('accessToken');
  },
});

export const login = mutationField('login', {
  type: nonNull(LoginPayload),
  args: {
    data: nonNull(
      arg({
        type: LoginInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const user = await context.prisma.user.findUnique({
      where: {
        email: args.data.email.toLowerCase(),
      },
      include: {
        infringements: true,
        organisations: true,
      },
    });

    if (!user) {
      throw new Error('Email or password is incorrect');
    }

    const valid = await argon2.verify(user.password, args.data.password);

    if (!valid) {
      throw new Error('Email or password is incorrect');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    context.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        infringements: user.infringements,
        organisations: user.organisations,
      },
      accessToken,
    };
  },
});
