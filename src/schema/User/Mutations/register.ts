import {
  inputObjectType,
  objectType,
  mutationField,
  nonNull,
  arg,
} from 'nexus';
import { Context } from 'src/context';
import { generateActivationToken } from '@/utilities/generateActivationToken';
import { hashPassword } from '@/utilities/hashPassword';
import { activationEmail, sendEmail } from '@/utilities/sendEmail';

export const RegisterInput = inputObjectType({
  name: 'RegisterInput',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

export const RegisterPayload = objectType({
  name: 'RegisterPayload',
  definition(t) {
    t.nonNull.string('message');
  },
});

export const register = mutationField('register', {
  type: nonNull(RegisterPayload),
  args: {
    data: nonNull(
      arg({
        type: RegisterInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const existingUser = await context.prisma.user.findUnique({
      where: {
        email: args.data.email,
      },
    });

    if (existingUser) {
      throw new Error('Account already exists with this email');
    }

    const hashedPassword = await hashPassword({
      password: args.data.password,
    });

    const token = generateActivationToken({
      name: args.data.name,
      email: args.data.email.toLowerCase(),
      password: hashedPassword,
    });

    const html = activationEmail(token);

    await sendEmail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: args.data.email,
      subject: 'Account Activation',
      html,
    });

    return {
      message: `Email has been sent to ${args.data.email}. Follow the instructions to activate your account`,
    };
  },
});
