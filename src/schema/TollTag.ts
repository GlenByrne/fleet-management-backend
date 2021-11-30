import {
  objectType,
  nonNull,
  arg,
  inputObjectType,
  extendType,
  idArg,
} from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { Organisation } from './Organisation';
import { Vehicle } from './Vehicle';

export const TollTag = objectType({
  name: 'TollTag',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
    t.nonNull.field('organisation', {
      type: Organisation,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.tollTag
          .findUnique({
            where: { id: parent.id },
          })
          .organisation();

        if (!organisation) {
          throw new Error('Organisation not found');
        }

        return organisation;
      },
    });
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.tollTag
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
  },
});

const TollTagInputFilter = inputObjectType({
  name: 'TollTagInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const TollTagQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('tollTags', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: TollTagInputFilter,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retreive toll tags. You are not logged in.'
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
            'Unable to retreive toll tags. You are not a member of this organisation'
          );
        }

        return context.prisma.tollTag.findMany({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              {
                tagNumber: {
                  contains:
                    args.data?.searchCriteria != null
                      ? args.data.searchCriteria
                      : undefined,
                  mode: 'insensitive',
                },
              },
            ],
          },
          orderBy: {
            tagNumber: 'asc',
          },
        });
      },
    });

    t.list.field('tollTagsNotAssigned', {
      type: TollTag,
      args: {
        organisationId: nonNull(idArg()),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve unassigned toll tags. You are not logged in.'
          );
        }

        const isInOrganisation =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId,
                organisationId: args.organisationId,
              },
            },
          });

        if (!isInOrganisation) {
          throw new Error(
            'Unable to retrieve unassigned toll tags. You are not a member of this organisation'
          );
        }

        return context.prisma.tollTag.findMany({
          where: {
            AND: [{ vehicleId: null }, { organisationId: args.organisationId }],
          },
          orderBy: {
            tagNumber: 'asc',
          },
        });
      },
    });
  },
});

const AddTollTagInput = inputObjectType({
  name: 'AddTollTagInput',
  definition(t) {
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
    t.nonNull.string('organisationId');
  },
});

const UpdateTollTagInput = inputObjectType({
  name: 'UpdateTollTagInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
  },
});

const DeleteTollTagInput = inputObjectType({
  name: 'DeleteTollTagInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const TollTagMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addTollTag', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: AddTollTagInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to add toll tag. You are not logged in.');
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
            'Unable to add toll tag. You are not a member of this organisation'
          );
        }

        const existingTag = await context.prisma.tollTag.findUnique({
          where: {
            tagNumber: args.data.tagNumber,
          },
        });

        if (existingTag) {
          throw new Error('Tag already exists with this number');
        }

        return context.prisma.tollTag.create({
          data: {
            tagNumber: args.data.tagNumber,
            tagProvider: args.data.tagProvider,
            organisation: {
              connect: {
                id: args.data.organisationId,
              },
            },
          },
        });
      },
    });

    t.nonNull.field('updateTollTag', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: UpdateTollTagInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          return context.prisma.tollTag.update({
            where: {
              id: args.data.id,
            },
            data: {
              tagNumber: args.data.tagNumber,
              tagProvider: args.data.tagProvider,
            },
          });
        } catch (error) {
          throw new Error('Error updating toll tag');
        }
      },
    });

    t.nonNull.field('deleteTollTag', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: DeleteTollTagInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.tollTag.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting toll tag');
        }
      },
    });
  },
});
