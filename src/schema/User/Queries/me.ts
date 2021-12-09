import { queryField } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { User } from '@/schema/User/User';

export const me = queryField('me', {
  type: User,
  resolve: (_, __, context: Context) => {
    const userId = verifyAccessToken(context);
    if (!userId) {
      throw new Error(
        'Unable to retrieve your account info. You are not logged in.'
      );
    }
    return context.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  },
});
