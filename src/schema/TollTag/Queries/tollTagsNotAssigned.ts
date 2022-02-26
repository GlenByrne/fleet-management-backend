import { queryField, nonNull, idArg, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { TollTag } from '@/schema/schemaExports';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';

export const TollTagsNotAssignedInput = inputObjectType({
  name: 'TollTagsNotAssignedInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const tollTagsNotAssigned = queryField((t) => {
  t.connectionField('tollTagsNotAssigned', {
    type: TollTag,
    nullable: false,
    additionalArgs: {
      data: nonNull(
        arg({
          type: TollTagsNotAssignedInput,
        })
      ),
    },
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to retrieve fuel cards. You are not logged in.'
        );
      }

      const isInOrganisation =
        await context.prisma.usersOnOrganisations.findUnique({
          where: {
            userId_organisationId: {
              userId,
              organisationId: args.data.organisationId,
            },
          },
        });

      if (!isInOrganisation) {
        throw new Error(
          'Unable to retrieve fuel cards. You are not a member of this organisation'
        );
      }

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.tollTag.count({
          where: {
            AND: [
              { vehicleId: null },
              { organisationId: args.data.organisationId },
            ],
          },
        }),
        context.prisma.tollTag.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            AND: [
              { vehicleId: null },
              { organisationId: args.data.organisationId },
            ],
          },
          orderBy: {
            tagNumber: 'asc',
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
