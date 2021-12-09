import { verify } from 'jsonwebtoken';
import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { ACTIVATION_TOKEN_SECRET } from 'src/server';

export const ActivateAccountInput = inputObjectType({
  name: 'ActivateAccountInput',
  definition(t) {
    t.nonNull.string('token');
  },
});

export const activateAccount = mutationField('activateAccount', {
  type: nonNull('Boolean'),
  args: {
    data: nonNull(
      arg({
        type: ActivateAccountInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    try {
      if (!args.data.token) {
        return false;
      }

      const decoded = verify(args.data.token, ACTIVATION_TOKEN_SECRET);

      const { name, email, password } = decoded as {
        name: string;
        email: string;
        password: string;
        exp: number;
      };

      const existingUser = await context.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        return true;
      }

      await context.prisma.user.create({
        data: {
          email,
          password,
          name,
        },
        select: {
          id: true,
          name: true,
          email: true,
          infringements: true,
          organisations: true,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  },
});
