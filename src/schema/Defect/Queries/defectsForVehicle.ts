import { queryField, nonNull, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';
import { Defect } from '@/schema/schemaExports';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';

export const DefectsForVehicleInput = inputObjectType({
  name: 'DefectsForVehicleInput',
  definition(t) {
    t.nonNull.id('vehicleId');
    t.nonNull.string('organisationId');
  },
});

export const defectsForVehicle = queryField((t) => {
  t.connectionField('defectsForVehicle', {
    type: Defect,
    nullable: false,
    additionalArgs: {
      data: nonNull(
        arg({
          type: DefectsForVehicleInput,
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
        context.prisma.defect.count({
          where: {
            vehicleId: args.data.vehicleId,
          },
        }),
        context.prisma.defect.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            vehicleId: args.data.vehicleId,
          },
          orderBy: {
            dateReported: 'desc',
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

// queryField('defectsForVehicles', {
//   type: list(Defect),
//   args: {
//     data: nonNull(
//       arg({
//         type: DefectsForVehiclesInput,
//       })
//     ),
//   },
//   resolve: (_, { data }, context: Context) => {
//     try {
//       return context.prisma.vehicle
//         .findUnique({
//           where: {
//             id: data.vehicleId,
//           },
//         })
//         .defects();
//     } catch (error) {
//       throw new Error('Error retrieving defects');
//     }
//   },
// });
