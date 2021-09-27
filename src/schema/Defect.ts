import { objectType, idArg, nonNull, extendType } from 'nexus';
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
      resolve: (_, { vehicleId }, context: Context) =>
        context.prisma.vehicle
          .findUnique({
            where: {
              id: vehicleId,
            },
          })
          .defects(),
    });
  },
});
