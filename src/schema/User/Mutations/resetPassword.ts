import { verify } from 'jsonwebtoken';
import {
  inputObjectType,
  objectType,
  mutationField,
  nonNull,
  arg,
} from 'nexus';
import { Context } from 'src/context';
import { RESET_PASSWORD_TOKEN_SECRET } from 'src/server';
import { hashPassword } from '@/utilities/hashPassword';

const ResetPasswordInput = inputObjectType({
  name: 'ResetPasswordInput',
  definition(t) {
    t.nonNull.string('resetPasswordToken');
    t.nonNull.string('newPassword');
  },
});

export const ResetPasswordPayload = objectType({
  name: 'ResetPasswordPayload',
  definition(t) {
    t.nonNull.string('message');
  },
});

export const resetPassword = mutationField('resetPassword', {
  type: nonNull(ResetPasswordPayload),
  args: {
    data: nonNull(
      arg({
        type: ResetPasswordInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    if (!args.data.resetPasswordToken) {
      throw new Error('No token found');
    }

    const decoded = verify(
      args.data.resetPasswordToken,
      RESET_PASSWORD_TOKEN_SECRET
    );

    const { userId } = decoded as {
      userId: string;
    };

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
      message: `Password reset! you can now log in with your new password`,
    };
  },
});
