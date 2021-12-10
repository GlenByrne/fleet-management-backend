import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Depot } from '@/schema/schemaExports';

export const AddDepotInput = inputObjectType({
  name: 'AddDepotInput',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('organisationId');
  },
});

export const addDepot = mutationField('addDepot', {
  type: nonNull(Depot),
  args: {
    data: nonNull(
      arg({
        type: AddDepotInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    try {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error('Unable to add depot. You are not logged in.');
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
          'Unable to add depot. You are not a member of this organisation'
        );
      }

      const existingDepot = await context.prisma.depot.findUnique({
        where: {
          name: args.data.name,
        },
      });

      if (existingDepot) {
        throw new Error('Depot already exists with this name');
      }

      return context.prisma.depot.create({
        data: {
          name: args.data.name,
          organisation: {
            connect: {
              id: args.data.organisationId,
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Error adding depot');
    }
  },
});
