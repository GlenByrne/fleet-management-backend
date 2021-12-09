import { queryField, nonNull, idArg } from 'nexus';
import { Context } from 'src/context';
import { User } from '@/schema/User/User';

export const user = queryField('user', {
  type: User,
  args: {
    userId: nonNull(idArg()),
  },
  resolve: (_, { userId }, context: Context) => {
    try {
      return context.prisma.user.findUnique({
        where: {
          id: userId,
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
