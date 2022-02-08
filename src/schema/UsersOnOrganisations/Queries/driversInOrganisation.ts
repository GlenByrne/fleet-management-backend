import {
  inputObjectType,
  objectType,
  queryField,
  nonNull,
  arg,
  list,
} from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Infringement, Depot } from '@/schema/schemaExports';
import { Role } from '@/schema/Enum';

const DriversInOrganisationInput = inputObjectType({
  name: 'DriversInOrganisationInput',
  definition(t) {
    t.nonNull.string('organisationId');
  },
});

export const DriversNoOrgsPayload = objectType({
  name: 'DriversNoOrgsPayload',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.list.nonNull.field('infringements', {
      type: Infringement,
    });
  },
});

export const DriversInOrganisationPayload = objectType({
  name: 'DriversInOrganisationPayload',
  definition(t) {
    t.nonNull.field('user', {
      type: DriversNoOrgsPayload,
    });
    t.nonNull.field('role', {
      type: Role,
    });
    t.field('depot', {
      type: Depot,
    });
  },
});

export const driversInOrganisation = queryField('driversInOrganisation', {
  type: list(DriversInOrganisationPayload),
  args: {
    data: nonNull(
      arg({
        type: DriversInOrganisationInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to get organisations drivers. You are not logged in.'
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
        'Unable to get organisations drivers. You are not a member of this organisation'
      );
    }

    return context.prisma.usersOnOrganisations.findMany({
      where: {
        AND: [
          { organisationId: args.data.organisationId },
          {
            role: 'DRIVER',
          },
        ],
      },
      select: {
        role: true,
        depot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            infringements: true,
            organisations: false,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  },
});
