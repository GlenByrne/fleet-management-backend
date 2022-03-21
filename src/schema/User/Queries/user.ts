import { queryField, nonNull, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { User } from '@/schema/schemaExports';

export const UserInput = inputObjectType({
  name: 'UserInput',
  definition(t) {
    t.nonNull.id('userId');
  },
});

export const user = queryField('user', {
  type: User,
  args: {
    data: nonNull(
      arg({
        type: UserInput,
      })
    ),
  },
  resolve: (_, { data }, context: Context) => {
    try {
      return context.prisma.user.findUnique({
        where: {
          id: data.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          infringements: true,
          organisations: true,
        },
      });
    } catch {
      throw new Error('Error retrieving user');
    }
  },
});
