import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Infringement } from '@/schema/schemaExports';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';

export const AddInfringementInput = inputObjectType({
  name: 'AddInfringementInput',
  definition(t) {
    t.nonNull.id('driverId');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.string('organisationId');
  },
});

export const addInfringement = mutationField('addInfringement', {
  type: nonNull(Infringement),
  args: {
    data: nonNull(
      arg({
        type: AddInfringementInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to add infringement. You are not logged in.');
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
        'Unable to add infringement. You are not a member of this organisation'
      );
    }

    const driver = await context.prisma.user.findUnique({
      where: {
        id: args.data.driverId,
      },
    });

    if (!driver) {
      throw new Error('Unable to add infringemnt. Driver not found.');
    }

    const userOrgConnection =
      await context.prisma.usersOnOrganisations.findUnique({
        where: {
          userId_organisationId: {
            userId: args.data.driverId,
            organisationId: args.data.organisationId,
          },
        },
        select: {
          role: true,
        },
      });

    if (userOrgConnection?.role !== 'DRIVER') {
      throw new Error(
        'Unable to add infringemnt. Infringements can only be added to a driver'
      );
    }

    return context.prisma.infringement.create({
      data: {
        description: args.data.description,
        dateOccured: args.data.dateOccured,
        status: 'UNSIGNED',
        driver: {
          connect: {
            id: args.data.driverId,
          },
        },
      },
    });
  },
});
