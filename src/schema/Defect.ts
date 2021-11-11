import {
  objectType,
  idArg,
  nonNull,
  extendType,
  arg,
  inputObjectType,
} from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { DefectStatus } from './Enum';

export const Defect = objectType({
  name: 'Defect',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.string('reporter');
    t.nonNull.date('dateReported');
    t.date('dateCompleted');
    t.nonNull.field('status', {
      type: DefectStatus,
    });
  },
});

export const DefectQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('defectsForVehicle', {
      type: Defect,
      args: {
        vehicleId: nonNull(idArg()),
      },
      resolve: (_, { vehicleId }, context: Context) => {
        try {
          return context.prisma.vehicle
            .findUnique({
              where: {
                id: vehicleId,
              },
            })
            .defects();
        } catch (error) {
          throw new Error('Error retrieving defects');
        }
      },
    });
  },
});

const AddDefectInput = inputObjectType({
  name: 'AddDefectInput',
  definition(t) {
    t.nonNull.string('description');
    t.nonNull.id('vehicleId');
  },
});

const UpdateDefectInput = inputObjectType({
  name: 'UpdateDefectInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.field('status', {
      type: DefectStatus,
    });
  },
});

const DeleteDefectInput = inputObjectType({
  name: 'DeleteDefectInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const DefectMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addDefect', {
      type: Defect,
      args: {
        data: nonNull(
          arg({
            type: AddDefectInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to add defect. You are not logged in.');
        }

        const user = await context.prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new Error('Unable to add defect. You are not logged in.');
        }

        return context.prisma.defect.create({
          data: {
            description: args.data.description,
            dateReported: new Date(),
            reporter: user.name,
            status: 'INCOMPLETE',
            vehicle: {
              connect: {
                id: args.data.vehicleId,
              },
            },
          },
        });
      },
    });

    t.nonNull.field('updateDefect', {
      type: Defect,
      args: {
        data: nonNull(
          arg({
            type: UpdateDefectInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const isComplete = args.data.status === 'COMPLETE';

          return context.prisma.defect.update({
            where: {
              id: args.data.id,
            },
            data: {
              description: args.data.description,
              status: args.data.status,
              dateCompleted: isComplete ? new Date() : null,
            },
          });
        } catch (error) {
          throw new Error('Error updating fuel card');
        }
      },
    });

    t.nonNull.field('deleteDefect', {
      type: Defect,
      args: {
        data: nonNull(
          arg({
            type: DeleteDefectInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.defect.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting defect');
        }
      },
    });
  },
});
