import { objectType, idArg, nonNull, extendType } from 'nexus';
import { Context } from '../context';
import { Defect } from './Defect';
import { Depot } from './Depot';
import { FuelCard } from './FuelCard';
import { TollTag } from './TollTag';

export const Vehicle = objectType({
  name: 'Vehicle',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.nonNull.date('cvrtDueDate');
    t.nonNull.date('thirteenWeekInspectionDueDate');
    t.nonNull.date('tachoCalibrationDueDate');
    t.field('depot', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .depot();
      },
    });
    t.nonNull.list.nonNull.field('defects', {
      type: Defect,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .defects();
      },
    });
    t.field('fuelCard', {
      type: FuelCard,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .fuelCard();
      },
    });
    t.field('tollTag', {
      type: TollTag,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .tollTag();
      },
    });
  },
});

export const VehicleQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('vehicles', {
      type: Vehicle,
      resolve: (_, __, context: Context) => context.prisma.vehicle.findMany(),
    });
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
