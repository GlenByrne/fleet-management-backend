import { queryField } from 'nexus';
import { Context } from 'src/context';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Infringement } from '@/schema/schemaExports';

const infringements = queryField((t) => {
  t.connectionField('infringements', {
    type: Infringement,
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to retrieve infringements. You are not logged in.'
        );
      }

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.infringement.count(),
        context.prisma.infringement.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          orderBy: {
            dateOccured: 'desc',
          },
        }),
      ]);

      return connectionFromArraySlice(
        items,
        { first: args.first, after: args.after },
        { sliceStart: offset, arrayLength: totalCount }
      );
    },
  });
});

export default infringements;
