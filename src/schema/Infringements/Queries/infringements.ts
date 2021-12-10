import { list, queryField } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Infringement } from '@/schema/schemaExports';

export const infringements = queryField('infringements', {
  type: list(Infringement),
  resolve: async (_, __, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to retrieve infringements. You are not logged in.'
      );
    }

    return context.prisma.infringement.findMany({
      orderBy: {
        dateOccured: 'desc',
      },
    });
  },
});
