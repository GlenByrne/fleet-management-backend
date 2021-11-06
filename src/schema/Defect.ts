import {
  objectType,
  idArg,
  nonNull,
  extendType,
  arg,
  inputObjectType,
} from 'nexus';
import { Context } from '../context';

export const Defect = objectType({
  name: 'Defect',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.date('dateReported');
    t.date('dateCompleted');
    t.string('status');
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
    t.nonNull.date('dateReported');
    t.string('status');
    t.nonNull.id('vehicleId');
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
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.defect.create({
            data: {
              description: args.data.description,
              dateReported: args.data.dateReported,
              status: args.data.status || '',
              vehicle: {
                connect: {
                  id: args.data.vehicleId,
                },
              },
            },
          });
        } catch (error) {
          throw new Error('Error adding defect');
        }
      },
    });
  },
});
