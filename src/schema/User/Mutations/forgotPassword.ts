import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { generateResetPasswordToken } from '@/utilities/generateResetPasswordToken';
import { resetPasswordEmail, sendEmail } from '@/utilities/sendEmail';

export const ForgotPasswordInput = inputObjectType({
  name: 'ForgotPasswordInput',
  definition(t) {
    t.nonNull.string('email');
  },
});

export const forgotPassword = mutationField('forgotPassword', {
  type: nonNull('Boolean'),
  args: {
    data: nonNull(
      arg({
        type: ForgotPasswordInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const user = await context.prisma.user.findUnique({
      where: {
        email: args.data.email,
      },
    });

    if (!user) {
      return true;
    }

    const token = generateResetPasswordToken({
      userId: user.id,
    });

    const html = resetPasswordEmail(token);

    await sendEmail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: user.email,
      subject: 'Password Reset',
      html,
    });

    return true;
  },
});
