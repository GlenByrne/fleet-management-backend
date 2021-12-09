import {
  inputObjectType,
  objectType,
  mutationField,
  nonNull,
  arg,
} from 'nexus';
import { Context } from 'src/context';
import argon2 from 'argon2';
import { hashPassword } from '@/utilities/hashPassword';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';

const ChangePasswordInput = inputObjectType({
  name: 'ChangePasswordInput',
  definition(t) {
    t.nonNull.string('currentPassword');
    t.nonNull.string('newPassword');
  },
});

export const ChangePasswordPayload = objectType({
  name: 'ChangePasswordPayload',
  definition(t) {
    t.nonNull.string('message');
  },
});

export const changePassword = mutationField('changePassword', {
  type: nonNull(ChangePasswordPayload),
  args: {
    data: nonNull(
      arg({
        type: ChangePasswordInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to change password. You are not logged in.');
    }

    const user = await context.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await argon2.verify(user.password, args.data.currentPassword);

    if (!valid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await hashPassword({
      password: args.data.newPassword,
    });

    await context.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: `Password changed! Please log back in to your account.`,
    };
  },
});
